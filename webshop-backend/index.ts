import cors from "cors"
import express, { NextFunction } from 'express'
import bodyParser from 'body-parser'
import socketio, { Packet, Socket } from "socket.io"
import http from "http"
import mongoose from "mongoose"
import { Client } from 'pg'
import Escape from "pg-escape"


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
    "mongodb+srv://mongo_user:mongo_user@webshop-vf9eh.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connection open");
});

//Postgres
const postgres = new Client({
    "user": "postgres",
    "host": "localhost",
    "database": "webshop",
    "password": "postgres",
    "port": 5433
})
postgres.connect()
    .then(() => console.info("Sucessfully connected to DB!"))
    .catch(() => console.error('Could not connect to DB!'))


io.on('connection', async (socket: Socket) => {
    socket.emit("message", "Shop", "Welcome!")

    console.log('Connection! Id:', socket.id)
    var subscriber = redis.createClient();

    const channel = socket.id

    subscriber.on('message', (channel: string, message: string) => {
        socket.emit("message", "Customer", message)
    });

    subscriber.subscribe(channel)

    var publisher = redis.createClient();

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
            // console.log(id)
            const sql = `
                SELECT * 
                FROM public.item
                WHERE id = $1
            `
            const escaped = Escape(sql)

            const res = await postgres.query(escaped, [id])
            if(res.rowCount !== 1) continue 
            res1.push(res.rows[0])
        }


        res.send(res1)

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