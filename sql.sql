CREATE TABLE pages (
 id integer PRIMARY KEY AUTOINCREMENT,
 name text NOT NULL
);

CREATE TABLE content (
 id integer PRIMARY KEY AUTOINCREMENT,
 pagename integer NOT NULL,
 text text NOT NULL
);

CREATE TABLE log (
 id integer PRIMARY KEY AUTOINCREMENT,
 content_id integer NOT NULL,
 date text NOT NULL,
 wpm text NOT NULL,
 type text NOT NULL,
 complete integer
);

CREATE TABLE train_sess (
  id integer PRIMARY KEY AUTOINCREMENT,
  date text NOT NULL,
  practice_ids text NOT NULL,
  practice_wpm text NOT NULL,
  train_ids text NOT NULL,
  train_wpm text NOT NULL,
  test_ids text NOT NULL,
  test_wpm text NOT NULL,
  test_past_wpm text NOT NULL,
  test_wpm_delta integer NOT NULL,
  total_wpm text NOT NULL
)