var userRouter = require('express').Router();

var userController = require('../controller/userController');


userRouter.route('/api/register').post(userController.register)

userRouter.route('/api/login').post(userController.login);

userRouter.route('/api/users').get(userController.retrive)

module.exports = userRouter;