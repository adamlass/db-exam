import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Button, Input, Form } from "reactstrap";


class Item extends Component {

    constructor(props) {
        super(props)
        const input = {}
        const {item} = this.props
        const itemName = "item-" + item.name

        input[itemName] = 1

        this.state = {
            input
        }
    }

    handleKeyPressed = async (e) => {
        let input = Object.assign({}, this.state.input)
        input[e.target.name] = e.target.value
        await this.setState({ input })
    }

    handleSubmit = async (e) => {
        e.preventDefault()
        const { item } = this.props

        const itemName = "item-" + item.name

        this.props.addItemToCart(item.id, this.state.input[itemName])
    }

    render() {
        const { item } = this.props
        const itemName = "item-" + item.name
        return (
            <Card className="mb-4">
                <CardBody>
                    <Row>
                        <Col>
                            <h5>{item.name}</h5>

                        </Col>
                        <Col>
                            <h4>${item.price} USD</h4>
                        </Col>
                        <Col xs={3}>
                            <Form onSubmit={this.handleSubmit}>
                                <Row>
                                    <Col className="p-0">
                                        <Input className="m-0" type="number" min={1} value={this.state.input[itemName]} name={itemName} onChange={this.handleKeyPressed} />

                                    </Col>
                                    <Col>
                                        <Button type="submit" color="success">Add</Button>

                                    </Col>
                                </Row>
                            </Form>

                        </Col>

                    </Row>


                </CardBody>
            </Card>
        );
    }
}

export default Item;