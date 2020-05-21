import cors from "cors"
import express, { NextFunction } from 'express'
import bodyParser from 'body-parser'
import socketio, { Packet, Socket } from "socket.io"
import http from "http"
import ioredis from "ioredis"
import mongoose from "mongoose"



const app = express()
const server = new http.Server(app)
const io = socketio(server, {
    origins: '*:*',
})


app.use(bodyParser.json());
app.use(cors())

server.listen(3000, () => console.log("App is online"))


mongoose.connect(
    "mongodb+srv://mongo_user:mongo_user@webshop-vf9eh.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
);

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("connection open");
});

var redis = require('ioredis');







io.on('connection', async (socket: Socket) => {
    socket.emit("message", "Shop", "Welcome!")

    console.log('Connection! Id:', socket.id)
    var subscriber = redis.createClient();

    const channel = "testChannel"

    subscriber.on('message', (channel: string, message: string) => {
        socket.emit("message", "Customer", message)
    });

    subscriber.subscribe("notification")

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
        publisher.publish("notification", message);
    })

})

app.get("/", (req, res) => res.send("Hello world"))



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