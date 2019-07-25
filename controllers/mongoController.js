const express = require("express");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Import the models to use its database functions.
const db = require("../models");

// A GET route for scraping the echoJS website
router.get("/scrape", (req, res) => {
  // First, we grab the body of the html with axios
  axios.get("https://www.gameinformer.com/features").then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    var numRec = $("article.node--type-article").length;
    $("article.node--type-article").each(function (i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object

      result.title = $(this)
        .find(".field--name-title")
        .text();
      result.summary = $(this)
        .find(".field--name-field-promo-summary")
        .text();
      result.link = "https://www.gameinformer.com" + $(this)
        .find("a")
        .attr("href");
      result.image = $(this)
        .find("img")
        .attr("src");
      console.log("article " + i);
      console.log(result);

        // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then((dbArticle) => {
          // View the added result in the console
          // console.log(dbArticle);
          if (i == numRec - 1) {
            console.log("get here... doone");
            // res.send("Scrape Complete");
          }
        })
        .catch((err) => {
          // console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  })
    .catch(err => {
      console.log(err);
    });
});

// Create all our routes and set up logic within those routes where required.
function findArticles(bSaved, handlebar, res) {
  db.Article.find({ issaved: bSaved })
  .then((dbArticle) => {
    console.log("..." + dbArticle.length);
      // If all Users are successfully found, send them back to the client
      const hbsObject = {
        articles: dbArticle,
        isAll: handlebar==="index"

      };
      res.render(handlebar, hbsObject);

    })
    .catch((err) => {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
}

router.get("/", (req, res) => {
  console.log("received reload request");
  findArticles(false, "index", res);
});

router.get("/saved", (req, res) => {
  findArticles(true, "saved", res);
});

// delete all documents in Article.
router.delete("/api/clear", (req, res) => {

  db.Article.deleteMany({},
    (err, result) => {
      res.status(200).end();
    }
  );
});

router.put("/api/save/:id", (req, res) => {

  db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: req.body })
    .then((dbArticle) => {
      // If the User was updated successfully, send it back to the client
      console.log("update success");
      return db.Article.find({ issaved: true });
    })
    .then((dbArticle) => {
      // If all Users are successfully found, send them back to the client
      const hbsObject = {
        articles: dbArticle,
        isAll: true
      };
      res.render("index", hbsObject);
    })
    .catch((err) => {
      // If an error occurs, send it back to the client
      res.status(500).json(err);
    });

});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", (req, res) => {

  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then((dbArticle) => {
      // If all Notes are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch((err) => {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
router.post("/articles/:id", (req, res) => {

  db.Note.create(req.body)
    .then((dbNote) => {
      // then find an article from the req.params.id
      // and update it's "note" property with the _id of the new note

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then((dbArticle) => {
      // If the User was updated successfully, send it back to the client
      return db.Article.findOne({ _id: req.params.id }).populate("notes");
    })
    .then((dbArticle) => {
      // If all Notes are successfully found, send them back to the client
      res.json(dbArticle);
    })
    .catch((err) => {
      // If an error occurs, send it back to the client
      res.status(500).json(err);
    });
});

// route for delete
router.delete("/api/delete/:articleId/:noteId", (req, res) => {

  // delete note by noteId
  db.Note.remove({ _id: req.params.noteId})
  .then( dbDeleted => {
    // If the note was deleted successfully, update the article.
    return db.Article.update( { _id: req.params.articleId }, { $pull: { notes: req.params.noteId } });
  })
  .then((error, dbUpdated) => {
    return db.Article.findOne({ _id: req.params.articleId }).populate("notes");
    // If all Notes are successfully found, send them back to the client
  })
  .then((dbArticle) => {
    // If all Notes are successfully found, send them back to the client
    res.json(dbArticle);
  })
  .catch((err) => {
    // If an error occurs, send it back to the client
    res.status(500).json(err);
  });
});

// Export routes for server.js to use.
module.exports = router;
