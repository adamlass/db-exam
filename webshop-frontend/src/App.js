import React, { Component } from 'react';
import { Container, Col, Row, } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from './Chat';
import SelectCategory from './SelectCategory';
import Items from "./Items"
import request2 from './request';
import Cart from './Cart';
import { long } from "./utils/GenUniqueID";
import qs from "querystring";


class App extends Component {
  custId

  constructor(props) {
    super(props)
    this.custId = long()
  }

  state = {
    items: [],
    cart: [],
    cartText: "No items in cart"
  }


  fetchProductsOfCategory = async (e) => {
    const category = e.target.value
    let products = await request2({
      url: "http://localhost:3000/products?category=" + escape(category)
    })
    products = JSON.parse(products.body)
    this.setState({ items: products })
  }

  updateCart = async (cart) => {
    const lines = cart.lines.map(({ itemId, amount, name }) => {
      return { itemId, amount, name }
    })
    this.setState({ cart: lines })
  }

  addItemToCart = async (id, amount) => {
    let result = await request2({
      url: "http://localhost:3000/cart",
      method: "POST",
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify({
        id,
        amount,
        custId: this.custId
      })
    })

    const cart = JSON.parse(result.body)

    this.setState({ cart })


  }

  deleteLine = async (_id) => {
    let result = await request2({
      url: `http://localhost:3000/cart/${this.custId}/line/${_id}`,
      method: "DELETE"
    })

    const cart = JSON.parse(result.body)

    this.setState({ cart })

  }

  submitOrder = async () => {
    let result = await request2({
      url: `http://localhost:3000/order/${this.custId}`,
      method: "POST"
    })
    console.log('result', result)
    if (result.statusCode !== 200) {
      alert(JSON.parse(result.body).message)
    } else {
      this.setState({ cart: [], cartText: "Order placed with id: " + result.body })
    }
  }

  render() {
    return (
      <Container className="text-center">
        <h2>WebShop - Exam project</h2>
        <a>Customer ID: {this.custId}</a>
        <br /><br /><hr />
        <Row>
          <Col xs={8}>
            <SelectCategory fetchProductsOfCategory={this.fetchProductsOfCategory} />
            <Items items={this.state.items} addItemToCart={this.addItemToCart} />
          </Col>
          <Col xs={4} className="text-center">
            <Cart className="mb-4"
              cart={this.state.cart}
              custId={this.custId}
              deleteLine={this.deleteLine}
              submitOrder={this.submitOrder}
              cartText={this.state.cartText} />
            <br />
            <Chat />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
