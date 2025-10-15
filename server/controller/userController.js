const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const User = require('../models/userModel');

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
};

const controller = {
    register : async  function(req, res) {
        try{
            const { username, password } = req.body;

            // Verifiation
            if (!username || !password) {
                return res.status(400).json({ error: 'Champs requis manquants' });
            }

            // Vérifie si l'utilisateur existe déjà
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ error: 'Nom d’utilisateur déjà pris' });
            }

            // Hash du mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Sauvegarde
            const newUser = new User({ username, password: hashedPassword });
            await newUser.save();

            res.status(201).json({ message: 'Utilisateur créé avec succès' });
        }catch(err){
            res.status(500).json({ error: err.message });
        }
    },

    login: async  function(req, res){
        try{
            const { username, password } = req.body;
            const user = await User.findOne({ username });

            if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

            // Création du token
            //const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {expiresIn: '1h',});

            const token = generateAccessToken({ id: user._id, username: user.username})
            res.json({ message: 'Connexion réussie', token });
                }catch(err){
                    res.status(500).json({ error: err.message });
                }
    },

    retrive: function(req, res){
        const user_exclude = req.query.user_exclude;
        console.log("user_exclude", user_exclude);

        if(user_exclude){
             User.find({username: { $ne: user_exclude} }).then( (users) => {
                
                res.status(200).send(users);
            }).catch((err) => {
                res.status(500).send({ error: 'An error occurred while retrieving users.' });
            });
        }else{
             User.find().then( (users) => {
                res.status(200).send(users);
            }).catch((err) => {
                res.status(500).send({ error: 'An error occurred while retrieving users.' });
            });
        }
           
    },

    retriveOne : function(req, res){
       const  username = req.params.username;
        User.findOne({ username: username }).then((user) => {
            if(user){
                res.status(200).send(user);
            }else{
                res.status(404).json({ error: 'User not found.' });
            }
        }).catch((err) => {
            res.status(500).json({ error: 'An error occurred while retrieving the User.' });
        })
    },

    findById : function(req, res) {
        const  userId = req.params.userId;
        User.findOne({ _id: userId }).then((user) => {
            if(user){
                res.status(200).send(user);
            }else{
                res.status(404).json({ error: 'User not found.' });
            }
        }).catch((err) => {
            res.status(500).json({ error: 'An error occurred while retrieving the User.' });
        })
    }
}

module.exports = controller;