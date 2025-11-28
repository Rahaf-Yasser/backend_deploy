const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Habiba6034*",
    database: "userdb"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL connected (db.js)");
});

module.exports = db;
