import React from "react";

function Dashboard({ accountNumbers, possibleUsers }) {
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
        // Increment the completed count for the user
        if (!summary.users[account.assignedTo]) {
          summary.users[account.assignedTo] = {
            completed: 1,
            uncompleted: 0,
            color: colors[index % colors.length],
          };
        } else {
          summary.users[account.assignedTo].completed++;
        }
      } else {
        summary.totalUncompleted++;
        // Increment the uncompleted count for the user
        if (!summary.users[account.assignedTo]) {
          summary.users[account.assignedTo] = {
            completed: 0,
            uncompleted: 1,
            color: colors[index % colors.length],
          };
        } else {
          summary.users[account.assignedTo].uncompleted++;
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
