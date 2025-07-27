import React, { useState, useEffect } from "react";
import { UserPlus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ManageUsers.css";

export default function ManageUsers() {
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "cashier",
    full_name: "",
    is_active: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/auth/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error(t("Error fetching users"), error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingUser
        ? `/api/auth/users/${editingUser.id}`
        : "/api/auth/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchUsers();
        resetForm();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message || t("Failed to save user"));
      }
    } catch (error) {
      console.error(t("Error saving user"), error);
      alert(t("Failed to save user"));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "", // Don't show existing password
      role: user.role,
      full_name: user.full_name || "",
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (userId, username) => {
    if (username === "admin") {
      alert(t("Cannot delete the main admin user"));
      return;
    }

    if (window.confirm(t("Are you sure you want to delete this user?"))) {
      try {
        const response = await fetch(`/api/auth/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchUsers();
        } else {
          alert(t("Failed to delete user"));
        }
      } catch (error) {
        console.error(t("Error deleting user"), error);
        alert(t("Failed to delete user"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      role: "cashier",
      full_name: "",
      is_active: true,
    });
    setEditingUser(null);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "accountant":
        return "bg-blue-100 text-blue-800";
      case "cashier":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`manage-users ${isRTL ? "rtl" : "ltr"}`}>
      <div className="page-header">
        <h1>{t("User Management")}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <UserPlus size={20} />
          {t("Add New User")}
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th className="username-col">{t("Username")}</th>
              <th className="fullname-col">{t("Full Name")}</th>
              <th className="role-col">{t("Role")}</th>
              <th className="status-col">{t("Status")}</th>
              <th className="created-col">{t("Created")}</th>
              <th className="actions-col">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="username-col">{user.username}</td>
                <td className="fullname-col">{user.full_name || "-"}</td>
                <td className="role-col">
                  <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                    {t(user.role)}
                  </span>
                </td>
                <td className="status-col">
                  <span
                    className={`badge ${
                      user.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.is_active ? t("Active") : t("Inactive")}
                  </span>
                </td>
                <td className="created-col">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="actions-col">
                  <div className="actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(user)}
                      title={t("Edit")}
                    >
                      <Edit size={16} />
                    </button>
                    {user.username !== "admin" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id, user.username)}
                        title={t("Delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingUser ? t("Edit User") : t("Add New User")}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t("Username")}</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>{t("Full Name")}</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  {t("Password")}{" "}
                  {editingUser && t("(leave blank to keep current)")}
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>{t("Role")}</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="cashier">{t("Cashier")}</option>
                  <option value="accountant">{t("Accountant")}</option>
                  <option value="admin">{t("Admin")}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  {t("Active User")}
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  {t("Cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? t("Update User") : t("Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
