import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Shield,
  User,
  Calendar,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/ManageUsers.css";

export default function ManageUsers() {
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      setLoading(true);
      const response = await fetch("/api/auth/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setError("Password is required for new users");
      return;
    }

    setLoading(true);
    setError("");

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save user");
      }

      fetchUsers();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      setError(error.message || "Failed to save user");
    } finally {
      setLoading(false);
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

  const handleDelete = async (user) => {
    if (user.username === "admin") {
      setError("Cannot delete the main admin user");
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
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
    setShowPassword(false);
    setError("");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield size={16} />;
      case "accountant":
        return <User size={16} />;
      case "cashier":
        return <User size={16} />;
      default:
        return <User size={16} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "role-admin";
      case "accountant":
        return "role-accountant";
      case "cashier":
        return "role-cashier";
      default:
        return "role-default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="manage-users-page">
      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="users-header">
        <div className="header-info">
          <h1>
            <Users size={24} />
            {t("User Management")}
          </h1>
          <p className="subtext">
            {t("Manage system users and their permissions")}
          </p>
        </div>
        <button
          className="add-user-button"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          disabled={loading}
        >
          <UserPlus size={20} />
          {t("Add New User")}
        </button>
      </div>

      {/* Users Table */}
      <div className="users-card">
        <div className="card-header">
          <div className="header-info">
            <h2>
              <Users size={20} />
              {t("System Users")}
            </h2>
            <p className="subtext">
              {users.length} {users.length !== 1 ? t("users") : t("user")}{" "}
              {t("in the system")}
            </p>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t("User")}</th>
                <th>{t("Role")}</th>
                <th>{t("Status")}</th>
                <th>{t("Created")}</th>
                <th>{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.full_name
                          ? user.full_name.charAt(0).toUpperCase()
                          : user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.username}</div>
                        <div className="user-fullname">
                          {user.full_name || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </div>
                  </td>
                  <td>
                    <div
                      className={`status-badge ${
                        user.is_active ? "status-active" : "status-inactive"
                      }`}
                    >
                      {user.is_active ? t("Active") : t("Inactive")}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(user)}
                        disabled={loading}
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                        {t("Edit")}
                      </button>
                      {user.username !== "admin" && (
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(user)}
                          disabled={loading}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                          {t("Remove")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !loading && (
          <div className="empty-state">
            <Users size={48} />
            <h3>{t("No users yet")}</h3>
            <p>{t("Add your first user to get started")}</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      {users.length > 0 && (
        <div className="summary-card">
          <div className="summary-info">
            <h4>
              <Users size={18} />
              {t("Users Summary")}
            </h4>
            <div className="subtext">{t("Total users in system")}</div>
          </div>
          <div className="summary-count">{users.length}</div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingUser ? <Edit2 size={20} /> : <UserPlus size={20} />}
                {editingUser ? t("Edit User") : t("Add New User")}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    {t("Username")}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder={t("Enter username")}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <User size={16} />
                    {t("Full Name")}
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    disabled={loading}
                    placeholder={t("Enter full name")}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <Shield size={16} />
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
                    disabled={loading}
                    placeholder={t("Enter password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Shield size={16} />
                    {t("Role")}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                    disabled={loading}
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
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      disabled={loading}
                    />
                    <span>{t("Active User")}</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="cancel-button"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="save-button"
                >
                  <Save size={16} />
                  {loading
                    ? t("Saving...")
                    : editingUser
                    ? t("Update User")
                    : t("Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h2>
                <Trash2 size={20} />
                {t("Confirm Delete")}
              </h2>
              <button
                className="modal-close"
                onClick={cancelDelete}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="delete-content">
              <div className="delete-warning">
                <div className="warning-icon">
                  <AlertTriangle size={48} />
                </div>
                <h3>{t("Are you sure you want to delete this user?")}</h3>
                <p>{t("This action cannot be undone.")}</p>
              </div>

              <div className="user-details">
                <div className="user-avatar">
                  {userToDelete.full_name
                    ? userToDelete.full_name.charAt(0).toUpperCase()
                    : userToDelete.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <div className="user-name">{userToDelete.username}</div>
                  <div className="user-fullname">
                    {userToDelete.full_name || "—"}
                  </div>
                  <div
                    className={`role-badge ${getRoleColor(userToDelete.role)}`}
                  >
                    {getRoleIcon(userToDelete.role)}
                    <span>{userToDelete.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={loading}
                className="cancel-button"
              >
                {t("Cancel")}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="delete-confirm-button"
              >
                <Trash2 size={16} />
                {loading ? t("Deleting...") : t("Delete User")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
