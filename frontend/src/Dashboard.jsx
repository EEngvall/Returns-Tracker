import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard({ accountNumbers }) {
  // State to store the list of users
  const [users, setUsers] = useState([]);

  // Function to fetch users from the backend API
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to calculate the summary
  const calculateSummary = () => {
    // Initialize summary object to keep track of counts for each user and state
    const summary = {
      totalCompleted: 0,
      totalUncompleted: 0,
      users: {},
    };

    // Define a set of colors for user highlighting
    const colors = [
      "#040D12",
      "#183D3D",
      "#5C8374",
      "#93B1A6",
      "#1D24CA",
      "#98ABEE",
      "#F9E8C9",
      "#33FF57",
      "#5733FF",
    ];

    // Loop through the account numbers to count completed and uncompleted accounts for each user
    accountNumbers.forEach((account, index) => {
      // If the account is checked (completed)
      if (account.checked) {
        summary.totalCompleted++;
      } else {
        summary.totalUncompleted++;
      }

      // Get the assigned user for the account
      const assignedTo = account.assignedTo || "Unassigned";

      // Increment the completed or uncompleted count for the user
      if (!summary.users[assignedTo]) {
        summary.users[assignedTo] = {
          completed: account.checked ? 1 : 0,
          uncompleted: account.checked ? 0 : 1,
          color: colors[index % colors.length],
        };
      } else {
        if (account.checked) {
          summary.users[assignedTo].completed++;
        } else {
          summary.users[assignedTo].uncompleted++;
        }
      }
    });

    return summary;
  };

  // Calculate the summary
  const summary = calculateSummary();

  return (
    <div>
      <h2 className="text-center">CSR Summary:</h2>
      <table className="table" style={{ color: "white" }}>
        <thead>
          <tr style={{ color: "black" }}>
            <th>User</th>
            <th>Completed</th>
            <th>Uncompleted</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(summary.users).map((user, index) => (
            <tr
              key={index}
              style={{ backgroundColor: summary.users[user].color }}
            >
              <td>{user}</td>
              <td>{summary.users[user].completed}</td>
              <td>{summary.users[user].uncompleted}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Total Completed: {summary.totalCompleted}</p>
      <p>Total Uncompleted: {summary.totalUncompleted}</p>
    </div>
  );
}

export default Dashboard;
