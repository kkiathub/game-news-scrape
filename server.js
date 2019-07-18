const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

// Require all models
const db = require("./models");

const PORT = process.env.PORT || 3000;


// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/mongoController.js");
app.use(routes);

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/hw14mongo";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes



// Route for getting all Articles from the db
app.get("/articles", (req, res) => {
  // TODO: Finish the route so it grabs all of the articles
  db.Article.find({})
  .then((dbArticle) => {
    // If all Users are successfully found, send them back to the client
    res.json(dbArticle);
  })
  .catch((err) => {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne(  { _id: req.params.id })
  .populate("note")
  .then((dbArticle) => {
    // If all Notes are successfully found, send them back to the client
    console.log(dbArticle);
    res.json(dbArticle);
  })
  .catch((err) => {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", (req, res) => {
  // TODO

  db.Note.create(req.body)
  .then((dbNote) => {
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note

    return db.Article.findOneAndUpdate( { _id: req.params.id }, { $set: { note: dbNote._id } }, { new: true });
  })
  .then((dbArticle) => {
    // If the User was updated successfully, send it back to the client
    res.json(dbArticle);
  })
  .catch((err) => {
    // If an error occurs, send it back to the client
    res.status(500).json(err);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log("App running on port " + PORT + "!");
});
