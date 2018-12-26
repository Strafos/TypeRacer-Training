// Express server hosting API endpoints
const express = require("express");
const bodyParser = require("body-parser");
const editJsonFile = require("edit-json-file");

const db = require("./database");
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 5001;

// POST example
app.post("/Log", (req, res) => {
  const { contentId, date, wpm, type, complete } = req.body;
  const query = `INSERT INTO log values(null, (?), (?), (?), (?), (?))`;
  db.insert(query, [contentId, date, wpm, type, complete])
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

// PUT example
app.put("/Log", (req, res) => {
  const { status } = req.body;
  const query = `UPDATE issues SET status='${status}' where id=${
    req.params.id
  }`;
  db.insert(query)
    .then(() => {
      res.send({ status: "Success" });
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

// GET RandomText
app.get("/RandomText", (req, res) => {
  let query = `SELECT id, pagename, text FROM content ORDER BY RANDOM() LIMIT 1`;
  db.read(query)
    .then(response => {
      res.send(response[0]);
    })
    .catch(err => {
      console.log(err);
    });
});

// DELETE example
app.delete("/Issue/:id", (req, res) => {
  const query = `DELETE FROM issues where id=${req.params.id}`;
  db.insert(query)
    .then(() => {
      res.send({ status: "Success" });
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
