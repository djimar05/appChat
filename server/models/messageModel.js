var mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    sender :  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver :  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content :   {type: String, required: true},
    createdAt : {type: Date, equired: true}
});

let Message = mongoose.model('Message', messageSchema);

module.exports = Message;