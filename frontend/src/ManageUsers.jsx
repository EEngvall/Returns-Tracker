import React, { useState, useEffect } from "react";
import axios from "axios";

const ManageUsers = ({
  possibleUsers,
  setPossibleUsers,
  handleUpdateAssignments,
}) => {
  const [newUser, setNewUser] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");
        setPossibleUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [setPossibleUsers]);

  const filteredUsers = possibleUsers.filter(
    (user) => user._id !== "65d90614921279a032a52e7f"
  ); // Filter out the designated user

  const addNewUser = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users", {
        username: newUser,
      });
      setPossibleUsers((prevUsers) => [...prevUsers, response.data]);
      setNewUser("");
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const removeUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      setPossibleUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );

      // Call a callback function passed from the parent component (App.js) to handle the update of assignments
      handleUpdateAssignments(userId);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
            {filteredUsers.map((user, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {user.username}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeUser(user._id)} // Pass userID instead of username
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
