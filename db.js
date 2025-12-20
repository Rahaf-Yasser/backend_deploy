const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "eventplanner-db",
    user: process.env.DB_USER || "user",
    password: process.env.DB_PASSWORD || "Habiba6034*",
    database: process.env.DB_NAME || "userdb"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("MySQL connected (db.js)");
});

module.exports = db;
