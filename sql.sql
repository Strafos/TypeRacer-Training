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