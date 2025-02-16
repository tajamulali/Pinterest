const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport"); // Make sure it's imported
const session = require("express-session"); // Required for passport session handling
const userModel = require("./routes/users"); // Ensure it's correctly imported
const LocalStrategy = require("passport-local").Strategy;

require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Error:", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// **Session Setup (Required for Passport)**
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false
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


// Session Configuration with MongoDB Store
app.use(session({
  secret: process.env.SESSION_SECRET || 'pinsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // Session expires in 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
  }
}));

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
