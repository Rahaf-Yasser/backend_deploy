const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rahaf6138", 
  database: "userdb"
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL connected!");
});

// Create database table if not exists
db.query(`
    CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
  )
`);

// Signup route
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating user" });
      }
      res.status(200).json({ message: "User registered successfully!" });
      
    }
  );
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) return res.status(500).send("Server error");
    if (users.length === 0) return res.status(404).send("User not found");

    const user = users[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "1h" });
    res.send({ message: "Login successful", token });
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));
