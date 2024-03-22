// require('dotenv').config()
// it is for node.js enviroment

// import 'dotenv/config'
import express from 'express';
// it is for javascript environment and to solve this error we have to go to the package.json file and add "type": "module" after main.

// const express = require('express');
const app = express();
const PORT = 3000;


app.get("/", (req, res) => {
    res.send(`heloo my server`);
})
app.get("/about", (req, res) => {
    res.send(`<h1>hello world</h1>`);
})


// app.get("/api/jokes", (req, res) => {
//     const jokes = [
//         {
//             id: 1,
//             title: 'A Joke',
//             content: 'This is my first joke'
//         },
//         {
//             id: 2,
//             title: 'Another Joke',
//             content: 'This is my Second joke'
//         },
//         {
//             id: 3,
//             title: 'Third Joke',
//             content: 'This is my Third joke'
//         },
//         {
//             id: 4,
//             title: 'Fourth Joke',
//             content: 'This is my Fourth joke'
//         },
//         {
//             id: 5,
//             title: 'Fifth Joke',
//             content: 'This is my Fifth joke'
//         },
//     ]
//     res.send(jokes);
// })



app.listen(PORT, () => {
    console.log(`app is listening on ${PORT}`);
})