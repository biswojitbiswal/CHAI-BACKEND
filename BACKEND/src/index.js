// require ('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./DB/db.js";
import { app } from "./app.js";


dotenv.config({
    path : './env'
})

const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error", error);
        throw error;
    })
    app.listen(PORT || 3000, () => {
        console.log(`app is listening on port ${PORT}`);
    }) 
})
.catch((err) => {
    console.log(`MongoDB connection failed `, err);
})