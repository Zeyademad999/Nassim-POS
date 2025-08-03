import express from "express";
import cors from "cors";
import initDB from "./models/initDB.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import barberRoutes from "./routes/barberRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js"; // ✅ New expense routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import expenseCategoryRoutes from "./routes/expenseCategoryRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import barberScheduleRoutes from "./routes/barberScheduleRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/services", serviceRoutes);
app.use("/api/barber-schedule", barberScheduleRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/expenses", expenseRoutes); // ✅ Expense tracking routes
app.use("/api/reports", reportRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/export", exportRoutes);

app.use("/api/settings", settingsRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Initialize DB and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📊 Available routes:`);
      console.log(`   - Services: http://localhost:${PORT}/api/services`);
      console.log(`   - Barbers: http://localhost:${PORT}/api/barbers`);
      console.log(`   - Products: http://localhost:${PORT}/api/products`);
      console.log(`   - Suppliers: http://localhost:${PORT}/api/suppliers`);
      console.log(`   - Customers: http://localhost:${PORT}/api/customers`);
      console.log(`   - Bookings: http://localhost:${PORT}/api/bookings`);
      console.log(`   - Expenses: http://localhost:${PORT}/api/expenses`); // ✅
      console.log(
        `   - Transactions: http://localhost:${PORT}/api/transactions`
      );
      console.log(`   - Receipts: http://localhost:${PORT}/api/receipts`);
      console.log(`   - Reports: http://localhost:${PORT}/api/reports`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize DB:", err);
  });
