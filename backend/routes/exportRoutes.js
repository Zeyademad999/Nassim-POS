import express from "express";
import dbPromise from "../utils/db.js";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

const router = express.Router();

// Helper function to get data based on type
const getData = async (type, period, startDate, endDate) => {
  const db = await dbPromise;

  switch (type) {
    case "expenses":
      return {
        headers: ["Date", "Name", "Type", "Amount", "Notes"],
        data: await db.all(`
          SELECT 
            DATE(expense_date) as date,
            name,
            CASE WHEN expense_type = 'general' THEN 'General' ELSE 'Recurring' END as type,
            PRINTF('%.2f EGP', amount) as amount,
            COALESCE(notes, '-') as notes
          FROM expenses 
          ORDER BY expense_date DESC 
          LIMIT 100
        `),
        title: "Expenses Report",
      };

    case "staff-performance":
      return {
        headers: [
          "Barber",
          "Transactions",
          "Revenue",
          "Avg per Transaction",
          "Performance",
        ],
        data: await db.all(`
          SELECT 
            barber_name as barber,
            COUNT(*) as transactions,
            PRINTF('%.2f EGP', SUM(total)) as revenue,
            PRINTF('%.2f EGP', AVG(total)) as avg_per_transaction,
            CASE 
              WHEN ROW_NUMBER() OVER (ORDER BY SUM(total) DESC) = 1 THEN 'Top Performer'
              WHEN ROW_NUMBER() OVER (ORDER BY SUM(total) DESC) = 2 THEN 'Good'
              ELSE 'Average'
            END as performance
          FROM transactions 
          WHERE barber_name IS NOT NULL
          GROUP BY barber_name
          ORDER BY SUM(total) DESC
        `),
        title: "Staff Performance Report",
      };

    case "recent-transactions":
      return {
        headers: ["Date", "Customer", "Barber", "Payment Method", "Total"],
        data: await db.all(`
          SELECT 
            DATE(created_at) as date,
            customer_name as customer,
            barber_name as barber,
            UPPER(payment_method) as payment_method,
            PRINTF('%.2f EGP', total) as total
          FROM transactions 
          ORDER BY created_at DESC 
          LIMIT 100
        `),
        title: "Recent Transactions Report",
      };

    case "low-stock":
      return {
        headers: ["Product", "Current Stock", "Reorder Level", "Supplier"],
        data: await db.all(`
          SELECT 
            p.name as product,
            p.stock_quantity as current_stock,
            p.reorder_level,
            COALESCE(s.name, 'No Supplier') as supplier
          FROM products p
          LEFT JOIN suppliers s ON p.supplier_id = s.id
          WHERE p.stock_quantity <= p.reorder_level
          ORDER BY p.stock_quantity ASC
        `),
        title: "Low Stock Alert Report",
      };

    case "profit-loss":
      const plData = await db.get(`
        SELECT 
          COALESCE(SUM(CASE WHEN t.total > 0 THEN t.total ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(e.amount), 0) as total_expenses
        FROM transactions t
        LEFT JOIN expenses e ON DATE(e.expense_date) >= DATE('now', '-30 day')
        WHERE DATE(t.created_at) >= DATE('now', '-30 day')
      `);

      return {
        headers: ["Description", "Amount", "% of Revenue"],
        data: [
          {
            description: "Total Income",
            amount: `${plData.total_revenue?.toFixed(2)} EGP`,
            percentage: "100.0%",
          },
          {
            description: "Total Expenses",
            amount: `${plData.total_expenses?.toFixed(2)} EGP`,
            percentage: `${(
              (plData.total_expenses / plData.total_revenue) *
              100
            ).toFixed(1)}%`,
          },
          {
            description: "Net Profit",
            amount: `${(plData.total_revenue - plData.total_expenses).toFixed(
              2
            )} EGP`,
            percentage: `${(
              ((plData.total_revenue - plData.total_expenses) /
                plData.total_revenue) *
              100
            ).toFixed(1)}%`,
          },
        ],
        title: "Profit & Loss Statement",
      };

    default:
      throw new Error("Invalid export type");
  }
};

// CSV Export
router.get("/csv/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { period = "7days", startDate, endDate } = req.query;

    const { headers, data, title } = await getData(
      type,
      period,
      startDate,
      endDate
    );

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header.toLowerCase().replace(/\s+/g, "_")] || "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nassim-${type}-${
        new Date().toISOString().split("T")[0]
      }.csv"`
    );
    res.send(csvContent);
  } catch (err) {
    console.error("CSV export failed:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

// Excel Export
router.get("/excel/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { period = "7days", startDate, endDate } = req.query;

    const { headers, data, title } = await getData(
      type,
      period,
      startDate,
      endDate
    );

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();

    // Add title row
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [headers], { origin: "A3" });

    // Style the worksheet
    ws["!cols"] = headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

    // Generate buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nassim-${type}-${
        new Date().toISOString().split("T")[0]
      }.xlsx"`
    );
    res.send(buffer);
  } catch (err) {
    console.error("Excel export failed:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

// PDF Export
router.get("/pdf/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { period = "7days", startDate, endDate } = req.query;

    const { headers, data, title } = await getData(
      type,
      period,
      startDate,
      endDate
    );

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, "bold");
    doc.text("NASSIM SELECT BARBER", 20, 20);

    doc.setFontSize(14);
    doc.text(title, 20, 35);

    // Add date
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);

    // Add table
    let yPos = 60;
    const pageHeight = doc.internal.pageSize.height;
    const colWidth = 170 / headers.length;

    // Headers
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    headers.forEach((header, index) => {
      doc.text(header, 20 + index * colWidth, yPos);
    });

    // Draw header line
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 10;

    // Data rows
    doc.setFont(undefined, "normal");
    data.slice(0, 25).forEach((row) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 30;
      }

      headers.forEach((header, colIndex) => {
        const value = row[header.toLowerCase().replace(/\s+/g, "_")] || "";
        const text = String(value).substring(0, 15);
        doc.text(text, 20 + colIndex * colWidth, yPos);
      });
      yPos += 8;
    });

    // Add footer
    doc.setFontSize(8);
    doc.text("Nassim Select Barber - Business Report", 20, pageHeight - 20);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="nassim-${type}-${
        new Date().toISOString().split("T")[0]
      }.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF export failed:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

export default router;
