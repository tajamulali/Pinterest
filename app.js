const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const createError = require("http-errors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");

// Load environment variables
require("dotenv").config();

// Load Routes
const indexRouter = require("./routes/index");
const userModel = require("./routes/users"); // ✅ Make sure this points to the correct User Model file

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// **Session Setup (Using MongoDB Store)**
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, // Session expires in 14 days
    }),
  })
);

// **Passport Setup**
app.use(passport.initialize());
app.use(passport.session());

// **Check if `userModel` has passport-local-mongoose properly applied**
if (typeof userModel.authenticate !== "function") {
  console.error("❌ ERROR: userModel.authenticate is not a function. Make sure passport-local-mongoose is applied.");
  process.exit(1);
}

passport.use(new LocalStrategy(userModel.authenticate()));

passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// **View Engine Setup**
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// **Middleware**
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// **Routes**
app.use("/", indexRouter);
app.use("/users", require("./routes/users")); // ✅ Ensure `routes/users.js` exists

// **Catch 404 and Forward to Error Handler**
app.use(function (req, res, next) {
  next(createError(404));
});

// **Error Handler**
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// **Normalize Port Function**
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; // Named pipe
  if (port >= 0) return port;  // Port number
  return false;
}

// **Start Server**
const PORT = normalizePort(process.env.PORT || 3000);
app.set("port", PORT);

const server = http.createServer(app);

// Handle server errors
server.on("error", (error) => {
  if (error.syscall !== "listen") throw error;

  const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Server listening event
server.on("listening", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Start listening
server.listen(PORT);

module.exports = app;
