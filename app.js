const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // ✅ Import MongoStore
const passport = require("passport");
const userModel = require("./routes/users");
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://nuwaib:appiii@pinterestclone.mongodb.net/pin?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

// **Session Setup (Now Using MongoDB Store)**
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURI,
        collectionName: "sessions",
        ttl: 14 * 24 * 60 * 60 // Session expires in 14 days
    })
}));

// **Passport Setup**
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Routes
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', require('./routes/users')); // Load Users Route Correctly

// Catch 404 and Forward to Error Handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error Handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
