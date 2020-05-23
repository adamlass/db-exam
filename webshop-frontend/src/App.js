import React, { Component } from 'react';
import { Container, Col, Row, } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from './Chat';
import SelectCategory from './SelectCategory';
import Items from "./Items"
import request2 from './request';



class App extends Component {

  state = {
    items: []
  }

  fetchProductsOfCategory = async (e) => {
    const category = e.target.value
    let products = await request2({
      url: "http://localhost:3000/products?category=" + category})
    console.log(products)
    products = JSON.parse(products.body)
    this.setState({ items: products })
  }

  render() {
    return (
      <Container className="text-center">
        <h2>WebShop - Exam project</h2>
        <Row>
          <Col xs={8}>
            <SelectCategory fetchProductsOfCategory={this.fetchProductsOfCategory} />
            <Items items={this.state.items} />
          </Col>
          <Col xs={4} className="text-center">
            <Chat />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
