const express = require('express');
const db = require('./config/db');
const http = require('http');
const ServerIO = require('socket.io')
const app = express();

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.static("../public"));

const Message = require('../server/models/messageModel')

var userRouter = require('./routes/userRouter')


app.use('/user', userRouter)


const httpServer = http.createServer(app)

const io = ServerIO(httpServer);

let users = {};

io.on("connection", (socket) => {
    console.log(`Nouvelle connexion : ${socket.id}`);
    
    socket.on('join', (user) => {
        socket.userConnected = user;
        socket.join(user)
        console.log("userId", user)
        
    });
    // Réception d'un message d'un utilisateur
    socket.on('sendMessage', (data) => {
        console.log("Message reçu : ", data);

        const {sender, receiver, content} = data;
        const newMessage = new Message({ sender, receiver, content, createdAt: Date.now() });
        newMessage.save().then((data) =>{
            console.log('Sauvegarde reussie!', data)
        }).catch((err) => {
            console.log('Erreur !', err)
        });

        io.emit('receiveMessage', data)
        
        console.log('sendMessage');
        
    })

    // Déconnexion d'un utilisateur
    socket.on('disconnect', () => {
       
        console.log('disconnect');
    });
});



httpServer.listen(3000, () => console.log('server is running '));