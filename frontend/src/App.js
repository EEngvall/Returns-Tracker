import React, { useState, useEffect, useRef } from "react";
import { Pagination } from "react-bootstrap";
import Dashboard from "./Dashboard";
import ManageUsers from "./ManageUsers";
import axios from "axios"; // Import axios

function App() {
  // State to store the entered account numbers, their checked status, and assigned user
  const [accountNumber, setAccountNumber] = useState("");
  const [accountNumbers, setAccountNumbers] = useState([]);
  // console.log("Initial accountNumbers state:", accountNumbers);
  const [rerenderTable, setRerenderTable] = useState(false); // State variable for triggering table re-render
  const [sortingCriteria, setSortingCriteria] = useState("");
  const [sortingUser, setSortingUser] = useState("");
  const [sortingStatus, setSortingStatus] = useState("");
  const [sortedAccountNumbers, setSortedAccountNumbers] = useState([]);
  const [sortDirection, setSortDirection] = useState("");
  const [newUser, setNewUser] = useState("");
  const [possibleUsers, setPossibleUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage, setAccountsPerPage] = useState(5); // Number of accounts per page
  const fileInputRef = useRef(null); // Ref for the file input element
  const [assignmentChanges, setAssignmentChanges] = useState(0); // State variable to track assignment changes

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

  const apiUrl = process.env.REACT_APP_API_URL;

  // Function to add a new account
  const addAccount = async () => {
    try {
      const defaultUserId = "65d90614921279a032a52e7f";
      const response = await axios.post(apiUrl + "/api/accounts/add", {
        accountNumber,
        assignedTo: defaultUserId,
      });
      // console.log("Response from server:", response); // Log the entire response
      const { account } = response.data; // Extract the account object from the response
      // console.log("Extracted account:", account); // Log the extracted account object
      setAccountNumbers([
        ...accountNumbers,
        { ...account, checked: false }, // Include the retrieved account details
      ]);
      setAccountNumber(""); // Clear the input field
      // console.log("Account added successfully");

      // Trigger a re-render of the table by updating a state variable
      setRerenderTable((prev) => !prev);
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  // Function to get user's name by ID
  const getUsernameById = (userId) => {
    // Find the user object with the matching ID
    const user = possibleUsers.find((user) => user._id === userId);
    // Return the username if the user is found, otherwise return "Unassigned"
    return user ? user.username : "Unassigned";
  };

  // Function to add a new user
  const addNewUser = () => {
    if (newUser.trim() !== "") {
      setPossibleUsers([...possibleUsers, newUser]);
      setNewUser(""); // Clear the input field after adding the user
    }
  };

  // Function to remove a user
  const removeUser = async (userToRemove) => {
    try {
      // Update the database to set the assignedTo field of accounts with the removed user to "Unassigned"
      const updatedAccounts = accountNumbers.map((account) => {
        if (account.assignedTo === userToRemove) {
          // Update the assignedTo field
          return { ...account, assignedTo: "Unassigned" };
        }
        return account;
      });

      // Update the accountNumbers state with the updated accounts
      setAccountNumbers(updatedAccounts);

      // Update the database with the new assignedTo values
      updatedAccounts.forEach(async (account) => {
        try {
          const response = await axios.put(
            apiUrl + `/api/accounts/${account._id}`,
            {
              assignedTo: "Unassigned",
            }
          );
          // console.log("Updated account:", response.data);
        } catch (error) {
          console.error("Error updating account:", error);
        }
      });

      // Remove the user from the possibleUsers state
      setPossibleUsers(possibleUsers.filter((user) => user !== userToRemove));
      // console.log("User removed successfully");
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  const handleUpdateAssignments = async (removedUserId) => {
    // Update the assignments in the accountNumbers state when a user is removed
    const updatedAccountNumbers = accountNumbers.map((account) => {
      if (account.assignedTo === removedUserId) {
        return { ...account, assignedTo: "Unassigned" };
      }
      return account;
    });
    setAccountNumbers(updatedAccountNumbers);

    // Update the database with the new assignedTo values
    updatedAccountNumbers.forEach(async (account) => {
      try {
        const response = await axios.put(
          apiUrl + `/api/accounts/${account._id}`,
          {
            assignedTo: account.assignedTo,
          }
        );
        // console.log("Updated account:", response.data);
      } catch (error) {
        console.error("Error updating account:", error);
      }
    });
  };

  const handleRemoveAccount = async (accountId) => {
    try {
      await axios.delete(apiUrl + `/api/accounts/remove/${accountId}`);
      const updatedAccountNumbers = accountNumbers.filter(
        (account) => account._id !== accountId
      );
      setAccountNumbers(updatedAccountNumbers);
      // console.log("Account removed successfully");
    } catch (error) {
      console.error("Error removing account:", error);
    }
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

  // Function to handle sorting
  const handleSort = (criteria) => {
    // Update sorting direction if the same criteria is clicked again
    if (sortingCriteria === criteria) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Reset sorting direction if a new criteria is selected
      setSortDirection("asc");
    }
    setSortingCriteria(criteria);
  };

  useEffect(() => {
    // Function to filter and sort account numbers
    const filterAndSortAccountNumbers = () => {
      let sortedNumbers = [...accountNumbers];

      if (sortingCriteria === "accountNumber") {
        sortedNumbers.sort((a, b) =>
          sortDirection === "asc"
            ? a.accountNumber.localeCompare(b.accountNumber)
            : b.accountNumber.localeCompare(a.accountNumber)
        );
      } else if (sortingCriteria === "assignedTo") {
        if (sortingUser) {
          // Filter accounts by selected user
          sortedNumbers = sortedNumbers.filter(
            (account) => account.assignedTo === sortingUser
          );
        }
        sortedNumbers.sort((a, b) =>
          sortDirection === "asc"
            ? a.assignedTo.localeCompare(b.assignedTo)
            : b.assignedTo.localeCompare(a.assignedTo)
        );
      } else if (sortingCriteria === "statusDescription") {
        sortedNumbers.sort((a, b) => {
          const statusA = a.statusDescription || ""; // Ensure statusDescription is defined or fallback to an empty string
          const statusB = b.statusDescription || ""; // Ensure statusDescription is defined or fallback to an empty string

          return sortDirection === "asc"
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        });
      } else if (sortingCriteria === "createdAt") {
        sortedNumbers.sort((a, b) =>
          sortDirection === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt)
        );
      } else if (sortingCriteria === "completed") {
        if (sortingStatus) {
          // Filter accounts by selected completion status
          const isCompleted = sortingStatus === "completed";
          sortedNumbers = sortedNumbers.filter(
            (account) => account.checked === isCompleted
          );
        }
        sortedNumbers.sort((a, b) => {
          if (a.checked === b.checked) return 0;
          return sortDirection === "asc"
            ? a.checked
              ? 1
              : -1
            : a.checked
            ? -1
            : 1;
        });
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
      const response = await axios.get(
        "https://returns-tracker-db.onrender.com/api/accounts"
      );
      // console.log("Fetched accounts data:", response.data);
      setAccountNumbers(response.data); // Update accountNumbers state with fetched data
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    // Call the fetchAccounts function when the component mounts
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(apiUrl + "/api/users");
        setPossibleUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
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
      await axios.put(apiUrl + `/api/accounts/${accountId}`, {
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
      await axios.put(apiUrl + `/api/accounts/${accountId}`, {
        assignedTo,
      });
      console.log("AssignedTo updated successfully:", assignedTo);

      // Increment assignment changes to trigger rerender
      setAssignmentChanges((prev) => prev + 1);
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
      const headers = lines[0].split(",").map((header) => header.trim()); // Trim whitespace and newline characters
      console.log(headers);

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
            const defaultUserId = "65d90614921279a032a52e7f";
            // Create a new account object and add it to the database
            const response = await axios.post(apiUrl + "/api/accounts/add", {
              accountNumber,
              statusDescription,
              assignedTo: defaultUserId,
            });
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
          {possibleUsers.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
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
      <td>{new Date(account.createdAt).toLocaleDateString("en-US")}</td>
      <td>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleRemoveAccount(account._id)}
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

          <div className="mt-4">
            <h2>Account Numbers:</h2>
            <table className="table table-striped">
              {/* Table headers */}
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("accountNumber")}
                    style={{ cursor: "pointer" }}
                  >
                    Account Number
                  </th>
                  <th
                    onClick={() => handleSort("assignedTo")}
                    style={{ cursor: "pointer" }}
                  >
                    Assigned To
                  </th>
                  <th
                    onClick={() => handleSort("statusDescription")}
                    style={{ cursor: "pointer" }}
                  >
                    Status Description
                  </th>
                  <th
                    onClick={() => handleSort("completed")}
                    style={{ cursor: "pointer" }}
                  >
                    Completed
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    style={{ cursor: "pointer" }}
                  >
                    Created
                  </th>
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
          <ManageUsers
            possibleUsers={possibleUsers}
            addNewUser={addNewUser}
            removeUser={removeUser}
            newUser={newUser}
            setNewUser={setNewUser}
            setPossibleUsers={setPossibleUsers}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
