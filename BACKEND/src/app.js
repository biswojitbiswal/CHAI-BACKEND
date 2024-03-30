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
// is a middleware used to parse cookies attached to the client's request object. When a client sends a request to the server, it often includes cookies, which are small pieces of data stored on the client's machine. These cookies can contain information such as session IDs, user preferences, authentication tokens, etc.
// you can access the cookies conveniently through the req.cookies object.
//  In many web applications, cookies are used to store authentication tokens or user credentials.
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