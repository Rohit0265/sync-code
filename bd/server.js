import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {YSocketIO} from "y-socket.io/dist/server" 
const app = express();
const server = createServer(app);
app.use(express.static("public"))

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})


const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()



app.get("/",(req,res)=>{
    res.send("hello")
})

app.get("/health",(req,res)=>{
    res.send("healthy")
})

server.listen(3000, () => {
  console.log("listening on *:3000");
});