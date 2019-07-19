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
  console.log("........ scraping");
  // axios.get("https://www.gamespot.com/").then((response) => {
  axios.get("https://www.gameinformer.com/features").then((response) => {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    const $ = cheerio.load(response.data);
    console.log("..... scrape,got data back");

    // Now, we grab every h2 within an article tag, and do the following:
    var numRec = $("article.node--type-article").length;
    console.log("num rec : " + numRec);
    $("article.node--type-article").each(function(i, element) {
      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
      console.log("..... " + i + "........");
      console.log($(this).find(".field--name-title").text());
      console.log( $(this).find(".field--name-field-promo-summary").text());
      console.log($(this).find("a").attr("href"));
      console.log($(this).find("img").attr("src"));
      console.log("...........................");

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

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then((dbArticle) => {
          // View the added result in the console
          // console.log(dbArticle);
          console.log("current I " + i);
        
          if (i== numRec-1) {
            console.log("get here... doone");
            res.send("Scrape Complete");

          }
        })
        .catch((err) => {
          // If an error occurred, log it
          // console.log(err);
        });
    });

    // Send a message to the client
    // res.send("Scrape Complete");
  })
  .catch(err => {
    console.log(err);
  });
});

// Create all our routes and set up logic within those routes where required.
router.get("/", (req, res) => {
  db.Article.find({})
  .then((dbArticle) => {
    // If all Users are successfully found, send them back to the client
    const hbsObject = {
      articles: dbArticle
    };
    res.render("index", hbsObject);

  })
  .catch((err) => {
    // If an error occurs, send the error back to the client
    res.json(err);
  });
});

// delete all documents in Article.
router.delete("/api/clear", (req, res) => {

  db.Article.deleteMany({},
    (err, result) => {
      res.status(200).end();
    }
  );
});
/*
router.post("/api/cats", (req, res) => {
  cat.create(["name", "sleepy"], [req.body.name, req.body.sleepy], result => {
    // Send back the ID of the new quote
    res.json({ id: result.insertId });
  });
});

router.put("/api/cats/:id", (req, res) => {
  const condition = "id = " + req.params.id;

  console.log("condition", condition);

  cat.update(
    {
      sleepy: req.body.sleepy
    },
    condition,
    result => {
      if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.status(200).end();

    }
  );
});


*/
// Export routes for server.js to use.
module.exports = router;
