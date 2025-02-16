var createError = require('http-errors'); 
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

var indexRouter = require('./routes/index');
const { User, passport } = require('./routes/users'); // Import the correct User model & Passport

const mongoose = require('mongoose');

// Debugging MongoDB URI
console.log("MongoDB URI:", process.env.MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined! Make sure you set it in your environment variables.");
  process.exit(1);
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
})
.then(() => console.log("✅ MongoDB connected successfully!"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

var app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

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
