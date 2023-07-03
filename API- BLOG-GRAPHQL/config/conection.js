const pg_promise = require("pg-promise");

const config = {
  host: "localhost",
  port: "5432",
  database: "blog_bd",
  user: "postgres",
  password: "root",
};

const pgp = pg_promise({});

const db = pgp(config);

exports.db=db;
