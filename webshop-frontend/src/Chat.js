import React, { Component } from 'react';
import io from 'socket.io-client';
import { Card, CardHeader, CardBody, CardFooter, Button, Row, Col } from 'reactstrap';


class Chat extends Component {
    socket

    state = {
        messages: [],
        input: {
            message: ""
        }
    }

    constructor(props) {
        super(props)
        this.socket = io('http://localhost:3000');
        this.socket.on("message", this.handleMessage)
    }


    handleKeyPressed = async (e) => {
        let input = Object.assign({}, this.state.input)
        input[e.target.name] = e.target.value
        await this.setState({ input })
    }

    handleMessage = async (sender, message) => {
        const now = new Date()
        let messages = Object.assign([], this.state.messages)
        messages.push("[" + String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0') + "] " + sender + " - " + message)
        await this.setState({ messages })
    }

    connect = async () => {
        console.log('Connected!')
    }

    async  componentDidMount() {
        this.socket.on('connect', this.connect);
    }

    handleChatSubmit = (e) => {
        e.preventDefault()
        this.socket.emit("sendMessage", this.state.input.message)
        let input = Object.assign({}, this.state.input)
        input["message"] = ""
        this.setState({ input })

    }

    render() {
        const { messages } = this.state
        const msg = messages.reduce((acc, cur) => acc + cur + "\n\n", "").toString()
        return (
                <Card>
                    <CardHeader>
                        <h3>Chat with us!</h3>
                    </CardHeader>
                    {/* {JSON.stringify(this.state.messages)} */}
                    <CardBody className="p-0">
                        <textarea style={{ height: 400, width:"100%" }} value={msg} readOnly />
                    </CardBody>
                    <CardFooter className="p-0">
                        <form className="m-0" style={{ width: 300 }} onSubmit={this.handleChatSubmit}>
                            <Row>
                                <Col>
                                    <textarea placeholder="Write us a message!" value={this.state.input.message} onChange={this.handleKeyPressed} name="message" />

                                </Col>
                                <Col>
                                    <Button type="submit">Send</Button>

                                </Col>
                            </Row>
                        </form>
                    </CardFooter>
                </Card>
        );
    }
}

export default Chat;