var express = require('express')
var app = express()
var cors = require('cors')

app.use(cors())

const io = require("socket.io")(8900, {
    cors:{
        origin: "http://localhost:3001",
        
    }
});

let users =[];

const addUser =(userId,socketId) =>{
    !users.some(user => user.userId === userId) && users.push({userId,socketId})
}

const removeUser=(socketId)=>{
    users = users.filter((user) => user.socketId !== socketId)
}

const getUser =(userId) =>{
    return users.find(user => user.userId === userId)
}

io.on("connection",(socket) => {
    //Connection
    console.log("A user is connected")

    //Get UserId and socket id of user
    socket.on("addUser", userId => {
        addUser(userId,socket.id);
        io.emit("getUsers",users)
    })

    //Send Message
    socket.on("sendMessage",({userId,receiverId,text}) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getMessage", {
            userId,
            text
        })
    })

    //Send Notification
   /* socket.on("sendNotification",({userId,receiverId,notification}) =>{
        const user = getUser(receiverId);
        io.to(user.socketId).emit("getNotification",{
            userId,
            notification
        })
    })*/


    //Disconnection
    socket.on("disconnect", () =>{
        console.log("A user is disconnected...")
        removeUser(socket.id)
        io.emit("getUsers",users)
    })

})