const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,  
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post' 
  }]
});

UserSchema.plugin(plm);

module.exports = mongoose.model('User', UserSchema);
