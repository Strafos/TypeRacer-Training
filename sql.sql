CREATE TABLE sprints (
 id integer PRIMARY KEY AUTOINCREMENT,
 name text NOT NULL,
 start_date text NOT NULL,
 end_date text NOT NULL, 
 notes text default '', 
 quote text default ''
);
