import express from "express";
import dbPromise from "../utils/db.js";

const router = express.Router();

const computeNextDueDate = (dateStr, period) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + parseInt(period));
  return d.toISOString().split("T")[0];
};

// GET all expenses with filtering
router.get("/", async (req, res) => {
  try {
    const {
      period = "30days",
      startDate,
      endDate,
      type = "all",
      limit = 100,
      offset = 0,
      sortBy = "date",
      order = "DESC",
    } = req.query;

    const db = await dbPromise;

    let query = `
      SELECT * FROM expenses
      WHERE 1=1
    `;

    const params = [];

    // Date filtering
    if (period === "custom" && startDate && endDate) {
      query += ` AND DATE(expense_date) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    } else if (period !== "all") {
      const days = {
        today: 0,
        "7days": 7,
        "30days": 30,
        "3months": 90,
        year: 365,
      };
      const daysBack = days[period] || 30;
      if (period === "today") {
        query += ` AND DATE(expense_date) = DATE('now')`;
      } else {
        query += ` AND DATE(expense_date) >= DATE('now', '-${daysBack} day')`;
      }
    }

    // Type filtering
    if (type !== "all") {
      query += ` AND expense_type = ?`;
      params.push(type);
    }

    // Validate sort parameters
    const validSortFields = [
      "name",
      "amount",
      "expense_date",
      "expense_type",
      "created_at",
    ];
    const validOrders = ["ASC", "DESC"];

    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : "expense_date";
    const sortOrder = validOrders.includes(order.toUpperCase())
      ? order.toUpperCase()
      : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const expenses = await db.all(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM expenses WHERE 1=1`;
    const countParams = [];

    // Apply same filters for count
    if (period === "custom" && startDate && endDate) {
      countQuery += ` AND DATE(expense_date) BETWEEN ? AND ?`;
      countParams.push(startDate, endDate);
    } else if (period !== "all") {
      const days = {
        today: 0,
        "7days": 7,
        "30days": 30,
        "3months": 90,
        year: 365,
      };
      const daysBack = days[period] || 30;
      if (period === "today") {
        countQuery += ` AND DATE(expense_date) = DATE('now')`;
      } else {
        countQuery += ` AND DATE(expense_date) >= DATE('now', '-${daysBack} day')`;
      }
    }

    if (type !== "all") {
      countQuery += ` AND expense_type = ?`;
      countParams.push(type);
    }

    const { total } = await db.get(countQuery, countParams);

    res.json({
      expenses,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    });
  } catch (err) {
    console.error("Failed to fetch expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// GET single expense
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    const expense = await db.get(`SELECT * FROM expenses WHERE id = ?`, [id]);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (err) {
    console.error("Failed to fetch expense:", err);
    res.status(500).json({ error: "Failed to fetch expense" });
  }
});

// POST create new expense
router.post("/", async (req, res) => {
  try {
    const {
      name,
      amount,
      expense_date,
      expense_type = "general",
      notes,
      recurrence_period,
    } = req.body;

    if (!name || !amount || !expense_date) {
      return res
        .status(400)
        .json({ error: "Name, amount, and date are required" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expense_date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format (YYYY-MM-DD)" });
    }

    const validTypes = ["general", "recurring"];
    if (!validTypes.includes(expense_type)) {
      return res.status(400).json({ error: "Invalid expense type" });
    }

    const db = await dbPromise;
    const expenseId = `exp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const computeNextDueDate = (dateStr, period) => {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + parseInt(period));
      return d.toISOString().split("T")[0];
    };

    const next_due_date =
      expense_type === "recurring" && recurrence_period
        ? computeNextDueDate(expense_date, recurrence_period)
        : null;

    await db.run(
      `
      INSERT INTO expenses (
        id, name, amount, expense_date, expense_type, notes, recurrence_period, next_due_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        expenseId,
        name.trim(),
        parseFloat(amount),
        expense_date,
        expense_type,
        notes?.trim() || null,
        recurrence_period || null,
        next_due_date,
      ]
    );

    const newExpense = await db.get(`SELECT * FROM expenses WHERE id = ?`, [
      expenseId,
    ]);
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("Failed to create expense:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
});

// PUT update expense
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      amount,
      expense_date,
      expense_type = "general",
      notes,
      recurrence_period,
    } = req.body;

    // Validation
    if (!name || !amount || !expense_date) {
      return res.status(400).json({
        error: "Name, amount, and date are required",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expense_date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format (YYYY-MM-DD)" });
    }

    // Validate expense type
    const validTypes = ["general", "recurring"];
    if (expense_type && !validTypes.includes(expense_type)) {
      return res.status(400).json({ error: "Invalid expense type" });
    }

    const db = await dbPromise;

    // Check if expense exists
    const existingExpense = await db.get(
      `SELECT id FROM expenses WHERE id = ?`,
      [id]
    );
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await db.run(
      `
      UPDATE expenses 
      SET 
        name = ?,
        amount = ?,
        expense_date = ?,
        expense_type = COALESCE(?, expense_type),
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        name.trim(),
        parseFloat(amount),
        expense_date,
        expense_type,
        notes?.trim() || null,
        id,
      ]
    );

    // Get the updated expense
    const updatedExpense = await db.get(`SELECT * FROM expenses WHERE id = ?`, [
      id,
    ]);

    res.json(updatedExpense);
  } catch (err) {
    console.error("Failed to update expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Check if expense exists
    const existingExpense = await db.get(
      `SELECT id FROM expenses WHERE id = ?`,
      [id]
    );
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    await db.run(`DELETE FROM expenses WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// GET expense statistics and summary
router.get("/stats/summary", async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    const db = await dbPromise;

    let dateCondition = "";
    if (period !== "all") {
      const days = {
        today: 0,
        "7days": 7,
        "30days": 30,
        "3months": 90,
        year: 365,
      };
      const daysBack = days[period] || 30;
      if (period === "today") {
        dateCondition = `WHERE DATE(expense_date) = DATE('now')`;
      } else {
        dateCondition = `WHERE DATE(expense_date) >= DATE('now', '-${daysBack} day')`;
      }
    }

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_expenses,
        SUM(amount) as total_amount,
        AVG(amount) as avg_expense,
        MIN(amount) as min_expense,
        MAX(amount) as max_expense,
        COUNT(CASE WHEN expense_type = 'general' THEN 1 END) as general_count,
        COUNT(CASE WHEN expense_type = 'recurring' THEN 1 END) as recurring_count,
        SUM(CASE WHEN expense_type = 'general' THEN amount ELSE 0 END) as general_amount,
        SUM(CASE WHEN expense_type = 'recurring' THEN amount ELSE 0 END) as recurring_amount
      FROM expenses
      ${dateCondition}
    `);

    // Get expenses by day for trend analysis
    const expensesByDay = await db.all(`
      SELECT 
        DATE(expense_date) as date,
        SUM(amount) as total_amount,
        COUNT(*) as count
      FROM expenses
      ${dateCondition}
      GROUP BY DATE(expense_date)
      ORDER BY DATE(expense_date) DESC
      LIMIT 30
    `);

    // Get recent expenses
    const recentExpenses = await db.all(`
      SELECT name, amount, expense_date, expense_type
      FROM expenses
      ${dateCondition}
      ORDER BY expense_date DESC, created_at DESC
      LIMIT 10
    `);

    res.json({
      summary: stats,
      expensesByDay,
      recentExpenses,
    });
  } catch (err) {
    console.error("Failed to fetch expense statistics:", err);
    res.status(500).json({ error: "Failed to fetch expense statistics" });
  }
});

export default router;
