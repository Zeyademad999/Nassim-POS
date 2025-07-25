import dbPromise from "../utils/db.js";
import { v4 as uuidv4 } from "uuid";

// POST /api/auth/login
export const login = async (req, res) => {
  const { username, password } = req.body;
  const db = await dbPromise;

  try {
    const user = await db.get(
      "SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1",
      [username, password]
    );

    if (user) {
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// GET /api/auth/users (Admin only)
export const getAllUsers = async (req, res) => {
  const db = await dbPromise;
  try {
    const users = await db.all(
      "SELECT id, username, role, full_name, is_active, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// POST /api/auth/users (Admin only)
export const createUser = async (req, res) => {
  const { username, password, role, full_name } = req.body;
  const db = await dbPromise;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Username, password and role are required" });
  }

  try {
    const id = uuidv4();
    await db.run(
      "INSERT INTO users (id, username, password, role, full_name) VALUES (?, ?, ?, ?, ?)",
      [id, username, password, role, full_name || username]
    );
    res.status(201).json({ id, username, role, full_name });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      res.status(400).json({ message: "Username already exists" });
    } else {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  }
};

// PUT /api/auth/users/:id (Admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role, full_name, is_active } = req.body;
  const db = await dbPromise;

  try {
    await db.run(
      "UPDATE users SET username = ?, password = ?, role = ?, full_name = ?, is_active = ? WHERE id = ?",
      [username, password, role, full_name, is_active, id]
    );
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// DELETE /api/auth/users/:id (Admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const db = await dbPromise;

  try {
    await db.run("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
