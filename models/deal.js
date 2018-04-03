var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Deal = new Schema({
    sellerID: {type: Schema.ObjectId, ref: 'Account', required: true},
    product: {type: String, required: true},
    time: {type: Date, default: Date.now()},
    imgURL : String
});

module.exports = mongoose.model('Deal', Deal);