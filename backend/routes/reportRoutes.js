import express from "express";
import dbPromise from "../utils/db.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { period = "7days", startDate, endDate, invoiceOnly } = req.query;
    const db = await dbPromise;

    // Enhanced date condition calculation
    let dateCondition = "";
    let invoiceCondition =
      invoiceOnly === "true" ? "AND t.send_invoice = 1" : "";

    if (period === "custom" && startDate && endDate) {
      dateCondition = `WHERE DATE(t.created_at) BETWEEN '${startDate}' AND '${endDate}' ${invoiceCondition}`;
    } else {
      const days = {
        today: 0,
        "7days": 7,
        "30days": 30,
        "3months": 90,
      };
      const daysBack = days[period] || 7;
      if (period === "today") {
        dateCondition = `WHERE DATE(t.created_at) = DATE('now') ${invoiceCondition}`;
      } else {
        dateCondition = `WHERE DATE(t.created_at) >= DATE('now', '-${daysBack} day') ${invoiceCondition}`;
      }
    }

    console.log(
      "📊 Generating comprehensive report with condition:",
      dateCondition
    );
    // Get active barbers to filter deleted ones
    const activeBarbers = await db.all(`SELECT id, name FROM barbers`);
    const activeBarberIds = new Set(activeBarbers.map((b) => b.id));
    const activeBarberNames = new Set(activeBarbers.map((b) => b.name));

    // 1. Total Revenue and Growth
    const totalRevenueRow = await db.get(`
      SELECT 
        SUM(total) as revenue,
        COUNT(*) as transaction_count,
        AVG(total) as avg_order_value
      FROM transactions t
      ${dateCondition}
    `);

    // Get previous period for growth calculation
    let prevDateCondition = "";
    if (period === "custom" && startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate);
      const daysDiff = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24));
      const prevStartDate = new Date(
        startD.getTime() - daysDiff * 24 * 60 * 60 * 1000
      );
      const prevEndDate = new Date(startD.getTime() - 24 * 60 * 60 * 1000);
      prevDateCondition = `WHERE DATE(t.created_at) BETWEEN '${
        prevStartDate.toISOString().split("T")[0]
      }' AND '${prevEndDate.toISOString().split("T")[0]}'`;
    } else {
      const days = { today: 1, "7days": 7, "30days": 30, "3months": 90 };
      const currentPeriod = days[period] || 7;
      const prevPeriod = currentPeriod * 2;
      prevDateCondition = `WHERE DATE(t.created_at) BETWEEN DATE('now', '-${prevPeriod} day') AND DATE('now', '-${currentPeriod} day')`;
    }

    const prevPeriodRevenue = await db.get(`
      SELECT SUM(total) as revenue, COUNT(*) as transaction_count
      FROM transactions t
      ${prevDateCondition}
    `);

    // Calculate growth percentages
    const revenueGrowth =
      prevPeriodRevenue?.revenue && prevPeriodRevenue.revenue > 0
        ? (
            (((totalRevenueRow?.revenue || 0) - prevPeriodRevenue.revenue) /
              prevPeriodRevenue.revenue) *
            100
          ).toFixed(1)
        : 0;

    const transactionGrowth =
      prevPeriodRevenue?.transaction_count &&
      prevPeriodRevenue.transaction_count > 0
        ? (
            (((totalRevenueRow?.transaction_count || 0) -
              prevPeriodRevenue.transaction_count) /
              prevPeriodRevenue.transaction_count) *
            100
          ).toFixed(1)
        : 0;

    // 2. Revenue by Day (for trend chart)
    const revenueByDay = await db.all(`
      SELECT 
        DATE(t.created_at) as date,
        SUM(t.total) as revenue,
        COUNT(*) as transactions
      FROM transactions t
      ${dateCondition}
      GROUP BY DATE(t.created_at)
      ORDER BY DATE(t.created_at) ASC
    `);

    // 3. Service Revenue Analysis
    const serviceRevenue = await db.all(`
      SELECT 
        s.name,
        COUNT(ti.id) as count,
        SUM(ti.price * ti.quantity) as revenue,
        AVG(ti.price * ti.quantity) as avg_revenue
      FROM transaction_items ti
      JOIN services s ON ti.service_id = s.id
      JOIN transactions t ON ti.transaction_id = t.id
      ${dateCondition.replace("WHERE", "WHERE ti.service_id IS NOT NULL AND")}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
    `);

    // 4. Enhanced Product Sales Analysis with units sold
    const productSales = await db.all(`
  SELECT 
    p.name,
    SUM(ti.quantity) as quantity,
    SUM(ti.price * ti.quantity) as revenue,
    AVG(ti.price) as avg_price,
    p.cost_price,
    (ti.price - COALESCE(p.cost_price, 0)) * SUM(ti.quantity) as profit
  FROM transaction_items ti
  JOIN products p ON ti.product_id = p.id  
  JOIN transactions t ON ti.transaction_id = t.id
  ${dateCondition.replace("WHERE", "WHERE ti.item_type = 'product' AND")}
  GROUP BY p.id, p.name, p.cost_price, ti.price
  ORDER BY revenue DESC
`);
    // 5. Enhanced Barber Performance Analysis (filter out deleted barbers)
    const barberPerformance = await db
      .all(
        `
      SELECT 
        b.name,
        b.specialty,
        COUNT(t.id) as count,
        SUM(t.total) as revenue,
        AVG(t.total) as avg_transaction,
        SUM(CASE WHEN t.payment_method = 'card' THEN 1 ELSE 0 END) as card_payments,
        SUM(CASE WHEN t.payment_method = 'cash' THEN 1 ELSE 0 END) as cash_payments
      FROM transactions t
      LEFT JOIN barbers b ON t.barber_id = b.id
      ${dateCondition}
      GROUP BY COALESCE(b.id, t.barber_name), b.name, b.specialty
      HAVING b.name IS NOT NULL
      ORDER BY revenue DESC
    `
      )
      .then((results) =>
        results.filter((barber) => activeBarberNames.has(barber.name))
      );

    // 6. Payment Methods Analysis
    const paymentMethods = await db.all(`
      SELECT 
        payment_method as method,
        COUNT(*) as count,
        SUM(total) as amount,
        AVG(total) as avg_amount
      FROM transactions t
      ${dateCondition}
      GROUP BY payment_method
      ORDER BY amount DESC
    `);

    // 7. Top and Low Performers
    const topService = serviceRevenue[0] || null;
    const lowService = serviceRevenue[serviceRevenue.length - 1] || null;
    const topBarber = barberPerformance[0] || null;
    const lowBarber = barberPerformance[barberPerformance.length - 1] || null;

    const recentTransactions = await db.all(`
  SELECT 
    t.*,
    GROUP_CONCAT(
      json_object(
        'name', COALESCE(s.name, p.name, ti.item_name),
        'quantity', ti.quantity,
        'price', ti.price,
        'type', ti.item_type
      )
    ) as items_json
  FROM transactions t
  LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
  LEFT JOIN services s ON ti.service_id = s.id AND ti.item_type = 'service'
  LEFT JOIN products p ON ti.product_id = p.id AND ti.item_type = 'product'
  ${dateCondition}
  GROUP BY t.id
  ORDER BY t.created_at DESC
  LIMIT 50
`);

    // Parse recent transactions items
    const parsedRecentTransactions = recentTransactions.map((tx) => {
      let items = [];
      try {
        if (tx.items_json) {
          const cleanJson = `[${tx.items_json}]`;
          items = JSON.parse(cleanJson);
        }
      } catch (e) {
        console.error("❌ Failed to parse items JSON:", e.message);
      }
      return { ...tx, items };
    });

    // 9. Low Stock Products Alert
    const lowStockProducts = await db.all(`
      SELECT 
        p.*,
        s.name as supplier_name,
        s.contact_person as supplier_contact
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.stock_quantity <= p.reorder_level
      ORDER BY p.stock_quantity ASC
    `);

    // 10. Customer Analysis
    const customerStats = await db.get(`
      SELECT 
        COUNT(DISTINCT customer_name) as unique_customers,
        AVG(total) as avg_spend_per_customer,
        COUNT(CASE WHEN customer_name = 'Walk-in Customer' THEN 1 END) as walk_in_count,
        COUNT(CASE WHEN customer_name != 'Walk-in Customer' THEN 1 END) as regular_customer_count
      FROM transactions t
      ${dateCondition}
    `);

    // Add this after your existing data fetching (around line 150, after the customer stats)

    // 13. Expense Analysis - NEW for P&L Report
    let expenseCondition = "";
    if (period === "custom" && startDate && endDate) {
      expenseCondition = `WHERE DATE(expense_date) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      const days = { today: 0, "7days": 7, "30days": 30, "3months": 90 };
      const daysBack = days[period] || 7;
      if (period === "today") {
        expenseCondition = `WHERE DATE(expense_date) = DATE('now')`;
      } else {
        expenseCondition = `WHERE DATE(expense_date) >= DATE('now', '-${daysBack} day')`;
      }
    }

    // Get total expenses
    const totalExpensesRow = await db.get(`
  SELECT 
    SUM(amount) as total_expenses,
    COUNT(*) as expense_count,
    AVG(amount) as avg_expense
  FROM expenses
  ${expenseCondition}
`);

    // Get expenses by category/type
    const expenseCategories = await db.all(`
  SELECT 
    expense_type,
    SUM(amount) as amount,
    COUNT(*) as count,
    AVG(amount) as avg_amount
  FROM expenses
  ${expenseCondition}
  GROUP BY expense_type
  ORDER BY amount DESC
`);

    // Get detailed expenses for the period
    const detailedExpenses = await db.all(`
  SELECT *
  FROM expenses
  ${expenseCondition}
  ORDER BY expense_date DESC
  LIMIT 50
`);

    // 11. Hourly Performance (if we have time data)
    const hourlyPerformance = await db.all(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as transactions,
        SUM(total) as revenue
      FROM transactions t
      ${dateCondition}
      GROUP BY strftime('%H', created_at)
      ORDER BY hour ASC
    `);

    // 12. Profit Analysis (for products with cost price)
    const profitAnalysis = await db.get(`
  SELECT 
    SUM((ti.price - COALESCE(p.cost_price, 0)) * ti.quantity) as total_profit,
    AVG((ti.price - COALESCE(p.cost_price, 0)) * ti.quantity) as avg_profit_per_sale,
    SUM(ti.price * ti.quantity) as total_product_revenue,
    COUNT(*) as product_sales_count
  FROM transaction_items ti
  JOIN products p ON ti.product_id = p.id  
  JOIN transactions t ON ti.transaction_id = t.id
  ${dateCondition.replace(
    "WHERE",
    "WHERE ti.item_type = 'product' AND p.cost_price IS NOT NULL AND"
  )}
`);

    // Compile comprehensive report
    const report = {
      // Overview Metrics
      totalRevenue: totalRevenueRow?.revenue || 0,
      totalTransactions: totalRevenueRow?.transaction_count || 0,
      averageOrderValue: totalRevenueRow?.avg_order_value || 0,
      revenueGrowth: parseFloat(revenueGrowth),
      transactionGrowth: parseFloat(transactionGrowth),
      aovGrowth: 0, // Calculate if needed

      // Top Performers
      topService,
      lowService,
      topBarber,
      lowBarber,

      // Detailed Data
      revenueByDay,
      serviceRevenue,
      productSales,
      barberPerformance,
      paymentMethods,
      recentTransactions: parsedRecentTransactions,
      lowStockProducts,

      // Additional Insights
      customerStats,
      hourlyPerformance,
      profitAnalysis,
      // P&L Report Data - Fixed calculations
      totalExpenses: totalExpensesRow?.total_expenses || 0,
      expenseCategories,
      detailedExpenses,
      netProfit:
        (totalRevenueRow?.revenue || 0) -
        (totalExpensesRow?.total_expenses || 0),
      profitMargin:
        (totalRevenueRow?.revenue || 0) > 0
          ? (((totalRevenueRow?.revenue || 0) -
              (totalExpensesRow?.total_expenses || 0)) /
              (totalRevenueRow?.revenue || 0)) *
            100
          : 0,

      // Enhanced financial metrics
      expenseCount: totalExpensesRow?.expense_count || 0,
      averageExpense: totalExpensesRow?.avg_expense || 0,

      // Metadata
      generatedAt: new Date().toISOString(),
      reportPeriod: period,
      dateRange: {
        start: startDate || `${period} ago`,
        end: endDate || "today",
      },
    };

    console.log("✅ Comprehensive report generated successfully");
    console.log("📊 Report summary:", {
      totalRevenue: report.totalRevenue,
      totalTransactions: report.totalTransactions,
      serviceCount: report.serviceRevenue.length,
      productCount: report.productSales.length,
      barberCount: report.barberPerformance.length,
    });

    res.json(report);
  } catch (err) {
    console.error("🔥 Report generation error:", err.message);
    console.error("🔥 Full error:", err);
    res
      .status(500)
      .json({ error: "Failed to generate report: " + err.message });
  }
});

// Excel Export Route
router.get("/export/excel", async (req, res) => {
  try {
    const { period = "7days", startDate, endDate } = req.query;
    const db = await dbPromise;

    // Get report data
    let dateCondition = "";
    if (period === "custom" && startDate && endDate) {
      dateCondition = `WHERE DATE(t.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      const days = { today: 0, "7days": 7, "30days": 30, "3months": 90 };
      const daysBack = days[period] || 7;
      if (period === "today") {
        dateCondition = `WHERE DATE(t.created_at) = DATE('now')`;
      } else {
        dateCondition = `WHERE DATE(t.created_at) >= DATE('now', '-${daysBack} day')`;
      }
    }

    const transactions = await db.all(`
      SELECT * FROM transactions t
      ${dateCondition}
      ORDER BY t.created_at DESC
    `);

    const serviceRevenue = await db.all(`
      SELECT 
        s.name,
        COUNT(ti.id) as count,
        SUM(ti.price * ti.quantity) as revenue
      FROM transaction_items ti
      JOIN services s ON ti.service_id = s.id
      JOIN transactions t ON ti.transaction_id = t.id
      ${dateCondition.replace("WHERE", "WHERE ti.service_id IS NOT NULL AND")}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
    `);

    const barberPerformance = await db.all(`
      SELECT 
        b.name,
        COUNT(t.id) as count,
        SUM(t.total) as revenue
      FROM transactions t
      LEFT JOIN barbers b ON t.barber_id = b.id
      ${dateCondition}
      GROUP BY COALESCE(b.id, t.barber_name)
      HAVING b.name IS NOT NULL
      ORDER BY revenue DESC
    `);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();

    // Transactions sheet
    const transactionsSheet = workbook.addWorksheet("Transactions");
    transactionsSheet.columns = [
      { header: "ID", key: "id", width: 15 },
      { header: "Date", key: "created_at", width: 15 },
      { header: "Customer", key: "customer_name", width: 20 },
      { header: "Barber", key: "barber_name", width: 20 },
      { header: "Total", key: "total", width: 10 },
      { header: "Payment Method", key: "payment_method", width: 15 },
    ];
    transactionsSheet.addRows(transactions);

    // Service Revenue sheet
    const servicesSheet = workbook.addWorksheet("Service Revenue");
    servicesSheet.columns = [
      { header: "Service", key: "name", width: 25 },
      { header: "Count", key: "count", width: 10 },
      { header: "Revenue", key: "revenue", width: 15 },
    ];
    servicesSheet.addRows(serviceRevenue);

    // Barber Performance sheet
    const barbersSheet = workbook.addWorksheet("Barber Performance");
    barbersSheet.columns = [
      { header: "Barber", key: "name", width: 20 },
      { header: "Transactions", key: "count", width: 15 },
      { header: "Revenue", key: "revenue", width: 15 },
    ];
    barbersSheet.addRows(barberPerformance);

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nassim-barber-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ error: "Failed to export Excel file" });
  }
});

// PDF Export Route
router.get("/export/pdf", async (req, res) => {
  try {
    const { period = "7days", startDate, endDate } = req.query;
    const db = await dbPromise;

    // Get summary data
    let dateCondition = "";
    if (period === "custom" && startDate && endDate) {
      dateCondition = `WHERE DATE(t.created_at) BETWEEN '${startDate}' AND '${endDate}'`;
    } else {
      const days = { today: 0, "7days": 7, "30days": 30, "3months": 90 };
      const daysBack = days[period] || 7;
      if (period === "today") {
        dateCondition = `WHERE DATE(t.created_at) = DATE('now')`;
      } else {
        dateCondition = `WHERE DATE(t.created_at) >= DATE('now', '-${daysBack} day')`;
      }
    }

    const summary = await db.get(`
      SELECT 
        SUM(total) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(total) as avg_order_value
      FROM transactions t
      ${dateCondition}
    `);

    const topServices = await db.all(`
      SELECT 
        s.name,
        SUM(ti.price * ti.quantity) as revenue
      FROM transaction_items ti
      JOIN services s ON ti.service_id = s.id
      JOIN transactions t ON ti.transaction_id = t.id
      ${dateCondition.replace("WHERE", "WHERE ti.service_id IS NOT NULL AND")}
      GROUP BY s.id, s.name
      ORDER BY revenue DESC
      LIMIT 5
    `);

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nassim-barber-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Nassim Barber Shop - Business Report", 50, 50);
    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    doc.text(
      `Period: ${period === "custom" ? `${startDate} to ${endDate}` : period}`,
      50,
      95
    );

    // Summary
    doc.fontSize(16).text("Summary", 50, 130);
    doc
      .fontSize(12)
      .text(`Total Revenue: ${summary.total_revenue?.toFixed(2)} EGP`, 50, 155)
      .text(`Total Transactions: ${summary.total_transactions}`, 50, 170)
      .text(
        `Average Order Value: ${summary.avg_order_value?.toFixed(2)} EGP`,
        50,
        185
      );

    // Top Services
    doc.fontSize(16).text("Top Services", 50, 220);
    let yPos = 245;
    topServices.forEach((service, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${service.name}: ${service.revenue?.toFixed(2)} EGP`,
          50,
          yPos
        );
      yPos += 15;
    });

    doc.end();
  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ error: "Failed to export PDF file" });
  }
});

// Transaction Management Routes

// GET all transactions with date filtering
// GET all transactions with date filtering
router.get("/transactions", async (req, res) => {
  try {
    const { period = "7days", startDate, endDate, invoiceOnly } = req.query;
    const db = await dbPromise;

    let dateCondition = "";
    let invoiceCondition = invoiceOnly === "true" ? "AND send_invoice = 1" : "";

    if (period === "custom" && startDate && endDate) {
      dateCondition = `WHERE DATE(created_at) BETWEEN '${startDate}' AND '${endDate}' ${invoiceCondition}`;
    } else {
      const days = { today: 0, "7days": 7, "30days": 30, "3months": 90 };
      const daysBack = days[period] || 7;
      if (period === "today") {
        dateCondition = `WHERE DATE(created_at) = DATE('now') ${invoiceCondition}`;
      } else {
        dateCondition = `WHERE DATE(created_at) >= DATE('now', '-${daysBack} day') ${invoiceCondition}`;
      }
    }

    const transactions = await db.all(`
      SELECT * FROM transactions
      ${dateCondition}
      ORDER BY created_at DESC
    `);

    res.json(transactions);
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// PUT update transaction
router.put("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, barber_name, total, payment_method, service_date } =
      req.body;
    const db = await dbPromise;

    await db.run(
      `
      UPDATE transactions 
      SET customer_name = ?, barber_name = ?, total = ?, payment_method = ?, service_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [customer_name, barber_name, total, payment_method, service_date, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update transaction:", err);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE transaction
router.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await dbPromise;

    // Delete transaction items first
    await db.run(`DELETE FROM transaction_items WHERE transaction_id = ?`, [
      id,
    ]);
    // Delete transaction
    await db.run(`DELETE FROM transactions WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete transaction:", err);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// POST create new transaction
router.post("/transactions", async (req, res) => {
  try {
    const {
      customer_name,
      barber_name,
      total,
      payment_method,
      service_date,
      subtotal,
      tax,
      discount_amount,
    } = req.body;
    const db = await dbPromise;

    const transactionId = `tx_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await db.run(
      `
      INSERT INTO transactions (id, customer_name, barber_name, total, payment_method, service_date, subtotal, tax, discount_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
      [
        transactionId,
        customer_name,
        barber_name,
        total,
        payment_method,
        service_date,
        subtotal || total,
        tax || 0,
        discount_amount || 0,
      ]
    );

    res.json({ success: true, id: transactionId });
  } catch (err) {
    console.error("Failed to create transaction:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// Specific report endpoints for different data needs

// GET /api/reports/financial - Detailed financial report
router.get("/financial", async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    const db = await dbPromise;

    const days = { "7days": 7, "30days": 30, "3months": 90 };
    const daysBack = days[period] || 30;

    const financialData = await db.get(`
      SELECT 
        SUM(total) as total_revenue,
        SUM(discount_amount) as total_discounts,
        SUM(tax) as total_tax,
        SUM(subtotal) as total_subtotal,
        AVG(total) as avg_transaction_value,
        COUNT(*) as total_transactions,
        SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) as card_revenue,
        SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_revenue
      FROM transactions
      WHERE DATE(created_at) >= DATE('now', '-${daysBack} day')
    `);

    res.json(financialData);
  } catch (err) {
    console.error("❌ Financial report error:", err);
    res.status(500).json({ error: "Failed to generate financial report" });
  }
});

// GET /api/reports/inventory - Inventory and product analysis
router.get("/inventory", async (req, res) => {
  try {
    const db = await dbPromise;

    const inventoryReport = await db.get(`
      SELECT 
        COUNT(*) as total_products,
        SUM(stock_quantity) as total_stock_units,
        SUM(stock_quantity * price) as total_inventory_value,
        SUM(stock_quantity * COALESCE(cost_price, 0)) as total_cost_value,
        COUNT(CASE WHEN stock_quantity <= reorder_level THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count
      FROM products
    `);

    const categoryBreakdown = await db.all(`
      SELECT 
        COALESCE(category, 'Uncategorized') as category,
        COUNT(*) as product_count,
        SUM(stock_quantity) as total_stock,
        SUM(stock_quantity * price) as category_value
      FROM products
      GROUP BY category
      ORDER BY category_value DESC
    `);

    res.json({
      summary: inventoryReport,
      categories: categoryBreakdown,
    });
  } catch (err) {
    console.error("❌ Inventory report error:", err);
    res.status(500).json({ error: "Failed to generate inventory report" });
  }
});

// GET /api/reports/staff - Detailed staff performance
router.get("/staff", async (req, res) => {
  try {
    const { period = "30days" } = req.query;
    const db = await dbPromise;

    const days = { "7days": 7, "30days": 30, "3months": 90 };
    const daysBack = days[period] || 30;

    // Get active barbers only
    const activeBarbers = await db.all(`SELECT id, name FROM barbers`);
    const activeBarberIds = new Set(activeBarbers.map((b) => b.id));

    const staffPerformance = await db.all(`
      SELECT 
        b.name,
        b.specialty,
        b.mobile,
        COUNT(t.id) as total_transactions,
        SUM(t.total) as total_revenue,
        AVG(t.total) as avg_transaction_value,
        MIN(t.created_at) as first_transaction,
        MAX(t.created_at) as last_transaction,
        COUNT(DISTINCT DATE(t.created_at)) as active_days,
        SUM(CASE WHEN t.payment_method = 'card' THEN 1 ELSE 0 END) as card_transactions,
        SUM(CASE WHEN t.payment_method = 'cash' THEN 1 ELSE 0 END) as cash_transactions
      FROM barbers b
      LEFT JOIN transactions t ON b.id = t.barber_id 
        AND DATE(t.created_at) >= DATE('now', '-${daysBack} day')
      GROUP BY b.id
      ORDER BY total_revenue DESC
    `);

    // Filter to only include active barbers
    const filteredPerformance = staffPerformance.filter(
      (staff) =>
        activeBarberIds.has(staff.id) ||
        activeBarbers.some((b) => b.name === staff.name)
    );

    res.json(filteredPerformance);
  } catch (err) {
    console.error("❌ Staff report error:", err);
    res.status(500).json({ error: "Failed to generate staff report" });
  }
});

export default router;
