import React from "react";

function AccountSummary({ accountNumbers }) {
  // Function to calculate the summary
  const calculateSummary = () => {
    // Initialize summary object to keep track of counts for each user and state
    const summary = {
      totalCompleted: 0,
      totalUncompleted: 0,
      users: {},
    };

    // Loop through the account numbers to count completed and uncompleted accounts for each user
    accountNumbers.forEach((account) => {
      // If the account is checked (completed)
      if (account.checked) {
        summary.totalCompleted++;
        // Increment the completed count for the user
        if (!summary.users[account.assignedTo]) {
          summary.users[account.assignedTo] = { completed: 1, uncompleted: 0 };
        } else {
          summary.users[account.assignedTo].completed++;
        }
      } else {
        summary.totalUncompleted++;
        // Increment the uncompleted count for the user
        if (!summary.users[account.assignedTo]) {
          summary.users[account.assignedTo] = { completed: 0, uncompleted: 1 };
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
    <div className="col-md-6">
      <h2>Account Summary:</h2>
      <p>Total Completed: {summary.totalCompleted}</p>
      <p>Total Uncompleted: {summary.totalUncompleted}</p>
      <h3>Summary by User:</h3>
      {Object.keys(summary.users).map((user, index) => (
        <div key={index}>
          <p>
            {user}: {summary.users[user].completed} completed,{" "}
            {summary.users[user].uncompleted} uncompleted
          </p>
        </div>
      ))}
    </div>
  );
}

export default AccountSummary;
