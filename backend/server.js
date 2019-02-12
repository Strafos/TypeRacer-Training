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
app.get("/Text", (req, res) => {
  let query = `SELECT id, pagename, text FROM content ORDER BY RANDOM() LIMIT 1`;
  db.read(query)
    .then(response => {
      res.send(response[0]);
    })
    .catch(err => {
      console.log(err);
    });
});

// GET GhostRandomText
// Text that already has been typed
app.get("/GhostText", (req, res) => {
  const query1 =
    `SELECT DISTINCT log.content_id, content.pagename, content.text ` +
    `FROM content INNER JOIN log ON content.id = log.content_id AND log.type = 'normal' ORDER BY RANDOM() LIMIT 1`;
  db.read(query1)
    .then(response1 => {
      // res.send(response1[0]);
      const { content_id } = response1[0];
      const query2 = `SELECT * FROM log WHERE content_id = (?) AND type = 'normal'`;
      db.insert(query2, [content_id])
        .then(response2 => {
          response1[0]["data"] = response2;
          console.log(response1[0]);
          res.send(response1[0]);
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
});

// DELETE example
app.delete("/Text/:id", (req, res) => {
  const query = `DELETE FROM content where id=${req.params.id}`;
  db.insert(query)
    .then(() => {
      res.send({ status: "Success" });
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

// get past typing data
app.get("/Log/:id", (req, res) => {
  const query = `SELECT * FROM log WHERE content_id = (?) AND type = 'normal'`;
  db.insert(query, [req.params.id])
    .then(response => {
      console.log(response);
      if (response.length > 0) {
        res.send(response);
      } else {
        res.send([]);
      }
    })
    .catch(err => {
      res.send(err);
    });
});

// Create Session log
app.post("/SessionLog", (req, res) => {
  const {
    date,
    practiceIds,
    practiceWpm,
    trainIds,
    trainWpm,
    testIds,
    testWpm,
    testWpmDelta,
    pastTestWpm,
    totalWpm,
  } = req.body;
  const query = `INSERT INTO train_sess values(null, (?), (?), (?), (?), (?), (?), (?), (?), (?), (?))`;
  db.insert(query, [
    date,
    practiceIds,
    practiceWpm,
    trainIds,
    trainWpm,
    testIds,
    testWpm,
    pastTestWpm,
    testWpmDelta,
    totalWpm,
  ])
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
