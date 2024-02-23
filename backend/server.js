const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
require("dotenv").config();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

const accountsRouter = require("./routes/accounts");

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(mongoURI, clientOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.use(express.json());

// Mount the accounts router
app.use("/api/accounts", accountsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
