var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Deal = new Schema({
    storeOwnerID: {type: Schema.ObjectId, ref: 'StoreOwner', required: true},
    details: {type: String, required: true},
    time: {type: Date, default: Date.now()},
    imgURL : String
});

module.exports = mongoose.model('Deal', Deal);