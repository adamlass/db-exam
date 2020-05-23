import React, { Component } from 'react';
import { Card, CardBody, Row, Col, Button } from "reactstrap";
class Items extends Component {

    render() {
        return (
            <>
                {this.props.items.map(item => {
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
                                    <Col xs={2}>
                                        <Button color="success">Add</Button>
                                    </Col>

                                </Row>


                            </CardBody>
                        </Card>
                    )

                })}
            </>
        );
    }
}

export default Items;