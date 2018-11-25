// Express server hosting API endpoints
const express = require("express");
const bodyParser = require("body-parser");
const editJsonFile = require("edit-json-file");

const db = require("./database");
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

// POST example
app.post("/Sprint", (req, res) => {
  const { name, startDate, endDate } = req.body;
  const query = `INSERT INTO sprints values(null, (?), (?), (?), '', '')`;
  const select = `SELECT * FROM sprints WHERE id in (SELECT last_insert_rowid());`;
  db.insertReturning(query, select, [name, startDate, endDate])
    .then(response => {
      res.send(response[0]);
    })
    .catch(err => {
      res.send({ status: "Failure" });
    });
});

// PUT example
app.put("/Issue/:id/status", (req, res) => {
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

// GET example
app.get("/Log/:id", (req, res) => {
  let query;
  if (req.query.type) {
    query =
      `SELECT timelog.id, timelog.issue_id, timelog.sprint_id, ` +
      `timelog.time_delta, timelog.time_stat, timelog.created_at, issues.name, timelog.total ` +
      `FROM timelog INNER JOIN issues ON timelog.issue_id = issues.id ` +
      `WHERE timelog.sprint_id=${req.params.id} AND timelog.time_stat='${
        req.query.type
      }';`;
  } else {
    query =
      `SELECT timelog.id, timelog.issue_id, timelog.sprint_id, ` +
      `timelog.time_delta, timelog.time_stat, timelog.created_at, issues.name, timelog.total ` +
      `FROM timelog INNER JOIN issues ON timelog.issue_id = issues.id ` +
      `WHERE timelog.sprint_id=${req.params.id};`;
  }
  db.read(query)
    .then(response => {
      res.send(response);
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
