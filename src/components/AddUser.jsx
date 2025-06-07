import React, { useState } from 'react'; 
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AddUser() {
  const navigate = useNavigate();
  const [form, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/users", form);
      alert("User added successfully!");
      navigate("/profile");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-gray-900 text-gray-900 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">Add User</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setFormData({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setFormData({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Password</label>
            <input
              type="password"
              onChange={(e) => setFormData({ ...form, password: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-base font-semibold mb-2 text-yellow-200">Role</label>
            <select
              value={form.role}
              onChange={(e) => setFormData({ ...form, role: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700/50 text-gray-200"
            >
              <option value="user">User</option>
              <option value="guide">Guide</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUser;