import cors from "cors"
import express, { NextFunction } from 'express'
import bodyParser from 'body-parser'
import socketio, { Packet, Socket } from "socket.io"
import http from "http"
import mongoose from "mongoose"
import { Client, Pool } from 'pg'
import Escape from "pg-escape"
import Cart, { ICart } from "./schema/Cart"
import Line, { ILine } from "./schema/Line"
import MyError from "./error/MyError"
import shortid from "shortid"
import { mongoURI } from "./mongoDB"
const REDIS_DB = 10
var redis = require('ioredis');
const neo4j = require('neo4j-driver')


//Neo4j
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "items"))
const session = driver.session()


//Socketio & express
const app = express()
const server = new http.Server(app)
const io = socketio(server, {
    origins: '*:*',
})

app.use(bodyParser.json());
app.use(cors())

server.listen(3000, () => console.log("App is online"))


//mongoose
mongoose.connect(
    mongoURI,
    { useNewUrlParser: true, useUnifiedTopology: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connection open");
});

//Postgres
const config = {
    "user": "postgres",
    "host": "localhost",
    "database": "webshop",
    "password": "postgres",
    "port": 5433
}
const postgres = new Client(config)
const pool = new Pool(config)

postgres.connect()
    .then(() => console.info("Sucessfully connected to DB!"))
    .catch(() => console.error('Could not connect to DB!'))


io.on('connection', async (socket: Socket) => {
    var subscriber = redis.createClient();
    subscriber.select(REDIS_DB)
    const randomKey = await subscriber.randomkey()
    const randomMsg = await subscriber.get(randomKey)

    socket.emit("message", "Shop", randomMsg)

    console.log('Connection! Id:', socket.id)

    const channel = socket.id

    subscriber.on('message', (channel: string, message: string) => {
        socket.emit("message", "Customer", message)
    });

    subscriber.subscribe(channel)

    var publisher = redis.createClient();
    publisher.select(REDIS_DB)

    socket.use((packet: Packet, next: NextFunction) => {
        try {
            const data = packet[1]
            const { id } = data

            socket.join(id)

            next()
        } catch (e) {
            errorHandler(e, socket)
        }

    })

    socket.on("sendMessage", (message) => {
        publisher.publish(channel, message);
    })

})

app.get("/", (req, res) => res.send("Hello world"))

app.get("/categories", async (req, res) => {
    try {
        let result = await session.run(
            'MATCH (n:Category) RETURN n.name',
        )

        result = result.records.map((record: any) => record["_fields"][0])
        res.send(result)

    } catch (e) {
        handleError(e, res)
    }

})

async function getItem(id: string) {
    const sql = `
                SELECT * 
                FROM public.item
                WHERE id = $1
            `
    const escaped = Escape(sql)

    const res = await postgres.query(escaped, [id])
    if (res.rowCount !== 1) return null
    return res.rows[0]
}

app.get("/products", async (req, res) => {
    try {
        const { category } = req.query

        let result = await session.run(
            'MATCH (c:Category)-[:CONTAINS]->(i:Item) WHERE c.name = $name RETURN i.id',
            { name: category }
        )

        result = result.records.map((record: any) => record["_fields"][0])

        console.log(result)

        let res1: object[] = []

        for (const id of result) {

            const item = await getItem(id)
            if (!item) continue

            res1.push(item)
        }


        res.send(res1)

    } catch (e) {
        handleError(e, res)
    }

})

async function addNamesToLines(cart: ICart | null) {
    if (cart) {
        let res = []
        for (const line of cart.lines) {
            const { _id, itemId, amount } = line
            const item = await getItem(itemId)
            res.push({ itemId, amount, name: item.name, price: item.price, _id })
        }
        return res
    }
    return null
}

app.post("/cart", async (req, res) => {
    try {
        const { amount, custId, id } = req.body
        let cart: ICart | null = await Cart.findOne({ custId: custId })
        if (!cart) {
            cart = new Cart({ custId })
            await cart.save()
        }

        const line: ILine = new Line({ itemId: id, amount })
        cart.lines.push(line)

        await cart.save()

        const cartResponse = await addNamesToLines(cart)

        res.send(cartResponse)

    } catch (e) {
        handleError(e, res)
    }
})




app.post("/order/:custId", async (req, res) => {
    try {
        const { custId } = req.params
        let cart: ICart | null = await Cart.findOne({ custId: custId })
        if (!cart) {
            throw new MyError("Cart does not exist!")
        } else if (cart.lines.length === 0) {
            throw new MyError("Cart is empty!")
        }




        const client = await pool.connect()
        try {
            console.log('BEGIN')
            await client.query('BEGIN')
            const getCustomerSql = `
                SELECT id
                FROM customer
                WHERE id=$1
            `

            let result = await client.query(getCustomerSql, [custId])
            if (result.rowCount !== 1) {
                const createCustomerSql = `
                    INSERT INTO customer
                    VALUES ($1)
                `
                await client.query(createCustomerSql, [custId])
            }

            const orderSql = `
                INSERT INTO orders
                (id, customer_id) VALUES ($1, $2)
            `

            const orderId = shortid()

            result = await client.query(orderSql, [orderId, custId])
            if (result.rowCount !== 1) {
                throw new MyError("Failed to create order!")
            }


            for (const line of cart.lines) {
                const { itemId, amount } = line
                const orderLineSql = `
                    INSERT INTO orderLine
                    (quantity, order_id, item_id) VALUES ($1,$2,$3)
                `
                result = await client.query(orderLineSql, [amount, orderId, itemId])
                if (result.rowCount !== 1) {
                    throw new MyError("Failed to create order line!")
                }
            }

            await cart.remove()

            console.log('COMMIT')
            await client.query('COMMIT')
            res.send(orderId)
        } catch (e) {
            console.log('ROLLBACK')
            console.log(e)
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }

    } catch (e) {
        handleError(e, res)
    }

})

app.delete("/cart/:custId/line/:id", async (req, res) => {
    try {
        const { custId, id } = req.params
        let cart: ICart | null = await Cart.findOne({ custId: custId })
        if (cart) {
            cart.lines = cart.lines.filter(line => {
                if (line._id == id) return false
                return true
            })
            await cart.save()
        }

        const cartResponse = await addNamesToLines(cart)

        res.send(cartResponse)
    } catch (e) {
        handleError(e, res)
    }
})




function handleError(e: any, res: any) {
    const status: number = e.status || 500
    const message: String = e.message || "Something went wrong!"

    let responseError = {
        status,
        message,
        stack: e.stack
    }

    res.status(status)
    res.send(responseError)
}



function errorHandler(e: Error, socket: SocketIO.Socket) {
    socket.error(e.message)
}