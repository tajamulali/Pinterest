const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    contact: String,
    password: String,
    profileImage: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }]
});

// Apply passport-local-mongoose plugin
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
