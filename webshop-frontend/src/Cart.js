import React, { Component } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Col, Row } from 'reactstrap';
import request2 from './request';

class Cart extends Component { 
    state = {
        text: "No items in cart"
    }
    
    render() {
        let total = 0
        const isCart = this.props.cart.length === 0
        return (
            <Card>
                <CardHeader>
                    <h3>Cart</h3>
                </CardHeader>
                <CardBody>
                    {
                        isCart ? <p>{this.props.cartText}</p> :
                            <>
                                {this.props.cart.map(item => {
                                    const { _id, amount, name, price } = item
                                    total += amount * price
                                    return (
                                        <>
                                            <p style={{ float: "right", cursor: "pointer" }} onClick={() => this.props.deleteLine(_id)}>x</p>
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
                    <Button onClick={this.props.submitOrder} color="success" disabled={isCart}>Place Order</Button>
                </CardFooter>
            </Card>
        );
    }
}

export default Cart;