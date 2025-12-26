const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:4200",
    "http://frontend-route-rahaf-yasser-dev.apps.rm3.7wse.p1.openshiftapps.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/events", require("./routes/events"));
app.use("/attendees", require("./routes/attendees"));
app.use("/tasks", require("./routes/tasks"));
app.use("/search", require("./routes/search"));
app.use("/invitations", require("./routes/invitations"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
});
