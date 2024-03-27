import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.urlencoded({extended: true, limit: "20kb"}))
// This middleware is used to parse incoming requests with URL-encoded payloads.
// The extended option, when set to true, allows for parsing of nested objects and arrays within the URL-encoded data.
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json());
// This middleware is used to parse incoming requests with JSON payloads.
// it automatically parses the JSON payload of incoming requests and exposes the resulting object on req.body

//routes

import userRoute from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users", userRoute)

// url
// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login

export {app}