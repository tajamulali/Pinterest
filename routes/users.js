const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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

// Use passport-local-mongoose plugin
UserSchema.plugin(plm);

const User = mongoose.model('User', UserSchema);

// Passport Local Strategy
passport.use(new LocalStrategy(User.authenticate()));

// Serialize and Deserialize User
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = {
  User,
  passport
};
