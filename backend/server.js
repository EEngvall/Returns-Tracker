const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
require("dotenv").config();

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "mongoDB-URI";

const client = new SecretsManagerClient({
  region: "us-west-1",
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret = response.SecretString;

const accountsRouter = require("./routes/accounts");
const usersRouter = require("./routes/users");

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(secret, clientOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.use(express.json());

// Mount the accounts router
app.use("/api/accounts", accountsRouter);
app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
