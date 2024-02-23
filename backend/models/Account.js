const mongoose = require("mongoose");

// Define the schema for the Account model
const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String,
    default: "Unassigned",
  },
  statusDescription: {
    type: String,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

// Create the Account model
const Account = mongoose.model("Account", accountSchema);

// Export the Account model
module.exports = Account;
