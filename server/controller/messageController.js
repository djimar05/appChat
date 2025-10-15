//const { retrive } = require("./userController")
const Message = require('../models/messageModel'); 
const User = require('../models/userModel'); 

const controller = {
    sendMessage : function(req, res) {
        Message.create(req.body).then((message) => {
            res.status(201).send(message);
        }).catch((err) => {
            res.status(500).send({ error: 'Erreur lors de la création du message.' });
        })
    },

    receiveMessage: function(req, res) {
        //const {sender, receiver, content} = req.body
    },

    

    retriveessages : async function(req, res){
        const senderUsername = req.query.sender;

        const receiverUsername = req.query.receiver;

        if(senderUsername && receiverUsername){
            // rechercher tous les message ou le sender ou le recever correspond au username
            const sender = await User.findOne({ username : senderUsername});
            const receiver = await User.findOne({ username : receiverUsername});

            if(!sender || !receiver){
                    
               res.status(400).send({ error: 'Données erronnées' })
            }
             console.log("find  message with condition sender and receiver");
            Message.find({
                $or: [
                    {sender: sender._id},
                    {receiver: receiver._id},
                    {sender: receiver._id},
                    {receiver: sender._id}
                ]
            }
            ).populate('sender')
            .populate('receiver').then((data) => {
                res.status(200).send(data);
            }).catch((err) => {
                res.status(500).send({ error: 'An error occurred while retrieving message.' });
            });
        }else{
            //retrieve all
            console.log("find all message");
            Message.find()
            .populate('sender')
            .populate('receiver')
            .then((data) => {
                res.status(200).send(data);
            }).catch((err) => {
                res.status(500).send({ error: 'An error occurred while retrieving message.' });
            });
        }
    }
}

module.exports = controller;