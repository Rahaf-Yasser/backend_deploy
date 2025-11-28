const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.signup = (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hashedPassword],
    (err) => {
      if (err) return res.status(500).json({ message: "Error creating user" });
      res.json({ message: "User registered successfully!" });
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (users.length === 0) return res.status(404).send("User not found");

    const user = users[0];
    const valid = bcrypt.compareSync(password, user.password);

    if (!valid) return res.status(401).send("Invalid password");

    const token = jwt.sign({ id: user.id }, "secret_key", { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  });
};
