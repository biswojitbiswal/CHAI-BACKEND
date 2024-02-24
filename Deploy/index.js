require('dotenv').config();
const express = require('express');
const app = express();
// const PORT = 3000;

app.get('/', (req, res) => {
    res.send("Hello World");
})

app.get('/login', (req, res) => {
    res.send("Hello World from login");
})

app.get('/signin', (req, res) => {
    res.send('<h1>hii i am a robot</h1>');
})

app.listen(process.env.PORT, () => {
    console.log(`App is listening on ${process.env.PORT}`);
});