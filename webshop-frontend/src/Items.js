import React, { Component } from 'react';
import Item from "./Item" 

class Items extends Component {

   

    render() {
        return (
            <>
                {this.props.items.map(item => {
                    return (
                        <Item key={item.id} item={item} {...this.props}/>
                    )

                })}
            </>
        );
    }
}

export default Items;