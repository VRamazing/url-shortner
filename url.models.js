var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
  name: {type: String, required: true, unique: true},
  uuid: {type: Number, required: true, unique: true}
})


module.exports = mongoose.model('Url', urlSchema);