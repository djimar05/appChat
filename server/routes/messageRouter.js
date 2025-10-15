var messageRouter =  require('express').Router();
var messageController = require('../controller/messageController');

messageRouter.route('/api/messages')
.post(messageController.sendMessage)
.get(messageController.retriveessages)


module.exports = messageRouter;