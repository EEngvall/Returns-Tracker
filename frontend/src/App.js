import React, { useState, useEffect, useRef } from "react";
import { Pagination } from "react-bootstrap";
import Dashboard from "./Dashboard";
import axios from "axios"; // Import axios

function App() {
  // State to store the entered account numbers, their checked status, and assigned user
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumbers, setAccountNumbers] = useState([]);
  const [sortingCriteria, setSortingCriteria] = useState("");
  const [sortingUser, setSortingUser] = useState("");
  const [sortingStatus, setSortingStatus] = useState("");
  const [sortedAccountNumbers, setSortedAccountNumbers] = useState([]);
  const [sortDirection, setSortDirection] = useState("");
  const [newUser, setNewUser] = useState("");
  const [possibleUsers, setPossibleUsers] = useState([
    "Unassigned",
    "Jesus",
    "Dana B",
    "Bobbie Jo",
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage, setAccountsPerPage] = useState(5); // Number of accounts per page
  const fileInputRef = useRef(null); // Ref for the file input element

  // Calculate the index of the last account on the current page
  const indexOfLastAccount = currentPage * accountsPerPage;
  // Calculate the index of the first account on the current page
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;

  // Function to change the current page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Slice the array of accounts to display only the accounts on the current page
  const currentAccounts = sortedAccountNumbers.slice(
    indexOfFirstAccount,
    indexOfLastAccount
  );

  // Function to add a new account
  const addAccount = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/accounts/add",
        {
          accountNumber,
        }
      );
      console.log("Response from server:", response); // Log the entire response
      const { account } = response.data; // Extract the account object from the response
      console.log("Extracted account:", account); // Log the extracted account object
      setAccountNumbers([
        ...accountNumbers,
        { ...account, checked: false }, // Include the retrieved account details
      ]);
      setAccountNumber(""); // Clear the input field
      console.log("Account added successfully");
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // Function to remove an account
  const removeAccount = async (index) => {
    try {
      const account = accountNumbers[index];
      const accountId = account._id; // Assuming each account has a unique ID
      await axios.delete(
        `http://localhost:5000/api/accounts/remove/${accountId}` // Use template literal to interpolate the accountId
      );
      const updatedAccountNumbers = [...accountNumbers];
      updatedAccountNumbers.splice(index, 1);
      setAccountNumbers(updatedAccountNumbers);
    } catch (error) {
      console.error("Error removing account:", error);
    }
  };

  // Function to add a new user
  const addNewUser = () => {
    if (newUser.trim() !== "") {
      setPossibleUsers([...possibleUsers, newUser]);
      setNewUser(""); // Clear the input field after adding the user
    }
  };

  // Function to remove a user
  const removeUser = (userToRemove) => {
    setPossibleUsers(possibleUsers.filter((user) => user !== userToRemove));
  };

  const handleRemoveAccount = (index) => {
    const account = accountNumbers[index];
    console.log("Account to remove:", account); // Log the account object
    removeAccount(index); // Pass the index to removeAccount function
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (accountNumber.trim() !== "") {
      // Call the addAccount function to add the new account
      addAccount(); // <-- Call the addAccount function here
    }
  };

  const handleAccountsPerPageChange = (e) => {
    setAccountsPerPage(parseInt(e.target.value)); // Update accounts per page
    setCurrentPage(1); // Reset current page to 1 when changing accounts per page
  };

  // Function to handle sorting criteria change
  const handleSortingChange = (e) => {
    setSortingCriteria(e.target.value);
    setSortingUser(""); // Reset sorting user when sorting criteria changes
    setSortingStatus(""); // Reset sorting status when sorting criteria changes
    setSortDirection(""); // Reset sorting direction when sorting criteria changes
  };

  // Function to handle sorting user change
  const handleSortingUserChange = (e) => {
    setSortingUser(e.target.value);
  };

  // Function to handle sorting status change
  const handleSortingStatusChange = (e) => {
    setSortingStatus(e.target.value);
  };

  useEffect(() => {
    // Function to filter and sort account numbers
    const filterAndSortAccountNumbers = () => {
      let sortedNumbers = [...accountNumbers];
      if (sortingCriteria === "assignedTo") {
        if (sortingUser) {
          // Filter accounts by selected user
          sortedNumbers = sortedNumbers.filter(
            (account) => account.assignedTo === sortingUser
          );
        }
        sortedNumbers.sort((a, b) =>
          a.assignedTo > b.assignedTo ? 1 : b.assignedTo > a.assignedTo ? -1 : 0
        );
      } else if (sortingCriteria === "completed") {
        if (sortingStatus) {
          // Filter accounts by selected completion status
          const isCompleted = sortingStatus === "completed";
          sortedNumbers = sortedNumbers.filter(
            (account) => account.checked === isCompleted
          );
        }
        sortedNumbers.sort((a, b) =>
          a.checked === b.checked ? 0 : a.checked ? 1 : -1
        );
      }
      if (sortDirection === "desc") {
        sortedNumbers.reverse();
      }
      return sortedNumbers;
    };

    const sortedAccounts = filterAndSortAccountNumbers();
    setSortedAccountNumbers(sortedAccounts);
  }, [
    sortingCriteria,
    sortingUser,
    sortingStatus,
    sortDirection,
    accountNumbers,
  ]);

  // Function to fetch account data from backend API
  const fetchAccounts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/accounts");
      setAccountNumbers(response.data); // Update accountNumbers state with fetched data
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };
  useEffect(() => {
    // Call the fetchAccounts function when the component mounts
    fetchAccounts();
  }, []);

  // Function to handle checkbox toggle
  const handleCheckboxToggle = async (index) => {
    try {
      // Toggle the checked status of the account number in the frontend
      const updatedAccountNumbers = [...accountNumbers];
      updatedAccountNumbers[index].checked =
        !updatedAccountNumbers[index].checked;
      setAccountNumbers(updatedAccountNumbers);

      // Send a request to update the checked field in the backend
      const accountId = updatedAccountNumbers[index]._id; // Assuming each account has a unique ID
      await axios.put(`http://localhost:5000/api/accounts/${accountId}`, {
        checked: updatedAccountNumbers[index].checked,
      });
      console.log("Checked status updated successfully");
    } catch (error) {
      console.error("Error updating checked status:", error);
      // Handle error if needed
    }
  };

  // Function to handle user assignment change
  const handleUserAssignmentChange = async (index, assignedTo) => {
    try {
      // Update the assigned user of the account number in the frontend
      const updatedAccountNumbers = [...accountNumbers];
      updatedAccountNumbers[index].assignedTo = assignedTo;
      setAccountNumbers(updatedAccountNumbers);

      // Send a request to update the assignedTo field in the backend
      const accountId = updatedAccountNumbers[index]._id; // Assuming each account has a unique ID
      await axios.put(`http://localhost:5000/api/accounts/${accountId}`, {
        assignedTo,
      });
      console.log("AssignedTo updated successfully:", assignedTo);
    } catch (error) {
      console.error("Error updating assignedTo:", error);
      // Handle error if needed
    }
  };

  // Function to handle sorting direction change
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const result = event.target.result;
      const lines = result.split("\n"); // Split the CSV content into lines
      const headers = lines[0].split(","); // Get the headers from the first line

      // Find the index of the desired columns (6th and 18th)
      const accountNumberIndex = headers.indexOf("Account Number");
      const statusDescriptionIndex = headers.indexOf("Status Description");

      // Skip the first line (headers) and process each subsequent line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(",");

          // Extract the desired values (6th and 18th) and assign them
          const accountNumber = values[accountNumberIndex];
          const statusDescription = values[statusDescriptionIndex];

          try {
            // Create a new account object and add it to the database
            const response = await axios.post(
              "http://localhost:5000/api/accounts/add",
              {
                accountNumber,
                statusDescription,
              }
            );
            console.log("Account added successfully:", response.data.account);
          } catch (error) {
            console.error("Error adding account:", error);
          }
        }
      }

      // Fetch updated account numbers after uploading the file
      fetchAccounts();
      fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  // Function to render each account row
  const renderAccountRow = (account, index) => (
    <tr key={index} className={account.checked ? "table-success" : ""}>
      <td>{account.accountNumber}</td>
      <td>
        <select
          className="form-select"
          value={account.assignedTo}
          onChange={(e) => handleUserAssignmentChange(index, e.target.value)}
        >
          {possibleUsers.map((user, index) => (
            <option key={index} value={user}>
              {user}
            </option>
          ))}
        </select>
      </td>
      <td>{account.statusDescription}</td>
      <td>
        <input
          type="checkbox"
          checked={account.checked}
          onChange={() => handleCheckboxToggle(index)}
        />
      </td>
      <td>{new Date(account.createdAt).toLocaleDateString("en-US")}</td>{" "}
      {/* Display createdAt field with mm/dd/yy format */}
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleRemoveAccount(index)}
        >
          Remove
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-7">
          <h1 className="mb-4 text-center">Returns Monitor</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="accountNumber">Enter Account Number:</label>
              <input
                type="text"
                className="form-control"
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <div className="mb-3">
              <label htmlFor="csvFile" className="form-label">
                Upload CSV File:
              </label>
              <input
                type="file"
                className="form-control"
                id="csvFile"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </div>
          </form>
          {/* Sorting filters */}
          <div className="mt-4">
            <label htmlFor="sortingCriteria">Sort by:</label>
            <select
              id="sortingCriteria"
              className="form-select"
              value={sortingCriteria}
              onChange={handleSortingChange}
            >
              <option value="">None</option>
              <option value="assignedTo">Assigned User</option>
              <option value="completed">Completion Status</option>
            </select>
            {sortingCriteria === "assignedTo" && (
              <div className="mt-2">
                <label htmlFor="sortingUser">Select User:</label>
                <select
                  id="sortingUser"
                  className="form-select"
                  value={sortingUser}
                  onChange={handleSortingUserChange}
                >
                  <option value="">All Users</option>
                  {possibleUsers.map((user, index) => (
                    <option key={index} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sortingCriteria === "completed" && (
              <div className="mt-2">
                <label htmlFor="sortingStatus">Select :</label>
                <select
                  id="sortingStatus" // Unique ID for sorting status dropdown
                  className="form-select"
                  value={sortingStatus}
                  onChange={handleSortingStatusChange}
                >
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                  <option value="uncompleted">Uncompleted</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h2>Account Numbers:</h2>
            <table className="table table-striped">
              {/* Table headers */}
              <thead>
                <tr>
                  <th onClick={handleSortDirectionChange}>Account Number</th>
                  <th onClick={handleSortDirectionChange}>Assigned To</th>
                  <th onClick={handleSortDirectionChange}>
                    Status Description
                  </th>
                  <th onClick={handleSortDirectionChange}>Completed</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.map((account, index) =>
                  renderAccountRow(account, index)
                )}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="d-flex justify-content-center">
              <Pagination>
                {Array.from(
                  {
                    length: Math.ceil(
                      sortedAccountNumbers.length / accountsPerPage
                    ),
                  },
                  (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      active={i + 1 === currentPage}
                    >
                      {i + 1}
                    </Pagination.Item>
                  )
                )}
              </Pagination>
            </div>
            <div className="col-md-6">
              <label htmlFor="accountsPerPage">Accounts Per Page:</label>
              <select
                id="accountsPerPage"
                className="form-select"
                value={accountsPerPage}
                onChange={handleAccountsPerPageChange}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                {/* Add more options as needed */}
              </select>
            </div>
          </div>
        </div>
        <div className="col-md-5">
          <Dashboard
            accountNumbers={accountNumbers}
            possibleUsers={possibleUsers}
          />

          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Manage CSRs</h2>
              <div className="mb-3">
                <label htmlFor="newUser" className="form-label">
                  Add New CSR:
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    id="newUser"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    className="form-control"
                  />
                  <button className="btn btn-primary" onClick={addNewUser}>
                    Add
                  </button>
                </div>
              </div>
              <div>
                <h3 className="card-title">Current CSRs:</h3>
                <ul className="list-group">
                  {possibleUsers.map((user, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {user}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeUser(user)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
