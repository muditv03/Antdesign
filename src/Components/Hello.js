import React from 'react';
import ReactDOM from 'react-dom';

function Hello(props){
    //const name=props.Name;
    console.log("hello");
    console.log('props is called'+props.name);
    return (
        <h1>hello {props.name}</h1>
    );
   
}

export default Hello;