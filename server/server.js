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

const authMiddleware = require('./middleware/authMiddleware')

var userRouter = require('./routes/userRouter')

var messageRouter = require('./routes/messageRouter')

app.use('/user', userRouter)

app.use('/message', authMiddleware.authMiddleware, messageRouter)


const httpServer = http.createServer(app)

const io = ServerIO(httpServer, {
    cors: { origin: '*' }
});

let users = {};

io.on("connection", (socket) => {
    console.log(`Nouvelle connexion : ${socket.id}`);
    
    socket.on('join', (user) => {
        users[user] = socket.id;
        console.log(`${user} est connecté (${socket.id})`);
        socket.userConnected = user;
        socket.join(user)
    });
    // Réception d'un message d'un utilisateur
    socket.on('sendMessage', (data) => {
        console.log("Message reçu : ", data);

        const {sender, receiver, content} = data;
        const receiverSocketId = users[receiver._id];
        
        if (receiverSocketId) {
             // envoyer au destinataire
             console.log('envoyer au destinataire')
            io.to(receiverSocketId).emit('receiveMessage', {sender, receiver, content});
            //socket.emit('receiveMessage', {sender, receiver, content})
            // renvoyer à l'expéditeur (pour affichage)
            console.log('renvoyer à expéditeur')
            socket.emit('sendMessage', {sender, receiver, content})
        }else{
            // socket.emit('errorMsg', `${receiver} n'est pas en ligne`);
            console.log('errorMsg', `${receiver} n'est pas en ligne`);
        }

        console.log(` socket.on#sendMessage#content : ${data.content}`)
        const newMessage = new Message({ sender, receiver, content: content, createdAt: Date.now() });
        newMessage.save().then((data) =>{
            console.log('Sauvegarde reussie!', data)
        }).catch((err) => {
            console.log('Erreur !', err)
        });

        //io.emit('receiveMessage', data)
        
        console.log('socket#sendMessage');
        
    })

    // Déconnexion d'un utilisateur
   /* socket.on('disconnect', () => {
       
        console.log('disconnect');
    });
    */
});



httpServer.listen(3000, () => console.log('server is running '));