const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware setups
app.use(cors()); // Allow all origins currently
app.use(express.json());

// Mount the routers
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/endorsements", require("./routes/endorsements"));
app.use("/api", require("./routes/reviewRoutes"));
app.use("/api/calendar", require("./routes/calendarRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// App level Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
