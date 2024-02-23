import React from "react";

function StatisticsPanel({ accountNumbers }) {
  // Function to compute statistics
  const computeStatistics = () => {
    const statistics = {
      users: {},
      completed: 0,
      uncompleted: 0,
    };

    // Count accounts assigned to each user and completed/uncompleted accounts
    accountNumbers.forEach((account) => {
      // Count accounts assigned to each user
      if (account.assignedTo !== "") {
        statistics.users[account.assignedTo] =
          (statistics.users[account.assignedTo] || 0) + 1;
      }

      // Count completed/uncompleted accounts
      if (account.checked) {
        statistics.completed++;
      } else {
        statistics.uncompleted++;
      }
    });

    return statistics;
  };

  // Get computed statistics
  const statistics = computeStatistics();

  return (
    <div className="col-md-6">
      <h2>Statistics</h2>
      <ul className="list-group">
        <li className="list-group-item">
          Completed Accounts: {statistics.completed}
        </li>
        <li className="list-group-item">
          Uncompleted Accounts: {statistics.uncompleted}
        </li>
        <li className="list-group-item">Accounts Assigned to Each User:</li>
        {Object.keys(statistics.users).map((user) => (
          <li
            key={user}
            className="list-group-item"
          >{`${user}: ${statistics.users[user]}`}</li>
        ))}
      </ul>
    </div>
  );
}

export default StatisticsPanel;
