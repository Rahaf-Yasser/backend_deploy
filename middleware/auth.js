const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).send("Access denied. No token provided.");

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, "secret_key");
    req.userId = decoded.id;
    req.role = decoded.role;  // STORE ROLE
    next();
  } catch (error) {
    return res.status(400).send("Invalid token.");
  }
};
