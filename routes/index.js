var express = require('express');
var router = express.Router();
const userModel = require('./users'); // Correct path for models
const passport = require('passport');
const upload = require('./multer'); // Correct path for multer
const postModel = require('./post');

const LocalStrategy = require("passport-local").Strategy;

// Ensure the model supports authentication
passport.use(new LocalStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/register', function(req, res, next) {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
      .findOne({ username: req.user.username }) // Use req.user instead of session
      .populate("posts");
    res.render('profile', { user, nav: true });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/show/posts', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel
      .findOne({ username: req.user.username })
      .populate("posts");
    res.render('show', { user, nav: true });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const posts = await postModel.find().populate("user");
    res.render('feed', { user, posts, nav: true });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.get('/add', isLoggedIn, async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    res.render('add', { user, nav: true });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.post('/createpost', isLoggedIn, upload.single("postimage"), async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.desc,
      image: req.file.filename
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function(req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.user.username });
    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.post('/register', async function(req, res, next) {
  try {
    const data = new userModel({
      name: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      contact: req.body.contact
    });

    await userModel.register(data, req.body.password);
    passport.authenticate("local")(req, res, function() {
      res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/",
  failureFlash: true
}));

router.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
