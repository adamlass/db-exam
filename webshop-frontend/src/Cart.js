import React, { Component } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Col, Row } from 'reactstrap';

class Cart extends Component {
    render() {
        let total = 0
        return (
            <Card>
                <CardHeader>
                    <h3>Cart</h3>
                </CardHeader>
                <CardBody>
                    {
                        this.props.cart.length === 0 ? <p>No items in cart</p> :
                            <>
                                {this.props.cart.map(item => {
                                    const {_id, amount, name, price } = item
                                    total += amount * price
                                    return (
                                        <>
                                                    <p style={{ float: "right", cursor:"pointer" }} onClick={() => this.props.deleteLine(_id)}>x</p>
                                                    <p><b>{amount}x</b></p>

                                            {/* <Row>
                                                <Col>

                                                </Col>
                                                <Col>
                                                </Col>
                                            </Row> */}

                                            <p> {name}</p>
                                            <p><b>${amount * price} USD</b></p>
                                            <hr />
                                        </>
                                    )
                                })}
                                <h5>TOTAL: ${total} USD</h5>
                            </>
                    }
                </CardBody>
                <CardFooter>
                    <Button color="success">Place Order</Button>
                </CardFooter>
            </Card>
        );
    }
}

export default Cart;