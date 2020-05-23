import React, { Component } from 'react';
import { FormGroup, Label, Input } from "reactstrap";
import request2 from "./request";

class SelectCategory extends Component {
    state = {
        categories: []
    }

    async componentDidMount() {
        let categories = await request2({
            url: "http://localhost:3000/categories"
        })
        categories = JSON.parse(categories.body)
        this.setState({ categories })
    }

    

    render() {
        return (
            <FormGroup style={{ width: "100%" }}>
                <Label for="exampleSelectMulti">Select Category</Label>
                <Input style={{ height: 150 }} type="select" name="selectMulti" id="exampleSelectMulti" multiple onChange={this.props.fetchProductsOfCategory}>
                    {this.state.categories.map(category => <option id={category}>{category}</option>)}
                </Input>
            </FormGroup>
        );
    }
}

export default SelectCategory;