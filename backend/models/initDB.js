import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define DB path
const dbPath = path.resolve(__dirname, "../nassim-barber.db");

// Initialize DB
const initDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create services table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      icon TEXT
    )
  `);

  // ✅ Create suppliers table for vendor management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ✅ Enhanced products table with supplier information
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      cost_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER DEFAULT 5,
      category TEXT,
      description TEXT,
      supplier_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
  `);

  // Add new columns to existing products table
  try {
    await db.exec(`ALTER TABLE products ADD COLUMN cost_price REAL`);
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE products ADD COLUMN reorder_level INTEGER DEFAULT 5`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(`ALTER TABLE products ADD COLUMN supplier_id TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // ✅ Create barbers table with mobile and specialty fields
  await db.exec(`
    CREATE TABLE IF NOT EXISTS barbers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT,
      specialty TEXT
    )
  `);

  // Add mobile and specialty columns if they don't exist (for existing databases)
  try {
    await db.exec(`ALTER TABLE barbers ADD COLUMN mobile TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(`ALTER TABLE barbers ADD COLUMN specialty TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // ✅ NEW: Customers table for customer management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL UNIQUE,
      email TEXT,
      preferred_barber_id TEXT,
      service_preferences TEXT,
      notes TEXT,
      total_visits INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      last_visit TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(preferred_barber_id) REFERENCES barbers(id)
    )
  `);

  // ✅ NEW: Bookings table for appointment management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      barber_id TEXT NOT NULL,
      service_ids TEXT,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      estimated_cost REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    )
  `);

  // ✅ NEW: Customer visit history tracking
  await db.exec(`
    CREATE TABLE IF NOT EXISTS customer_visits (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      transaction_id TEXT,
      visit_date TEXT NOT NULL,
      services_received TEXT,
      barber_id TEXT,
      amount_spent REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    )
  `);

  // ✅ Enhanced transactions table with payment info and invoice settings
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      customer_id TEXT,
      barber_name TEXT,
      barber_id TEXT,
      service_date TEXT,
      subtotal REAL,
      discount_amount REAL DEFAULT 0,
      tax REAL,
      total REAL,
      payment_method TEXT DEFAULT 'cash',
      send_invoice BOOLEAN DEFAULT 0,
      created_at TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES customers(id),
      FOREIGN KEY(barber_id) REFERENCES barbers(id)
    )
  `);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'accountant', 'cashier')),
    full_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
  // Add new columns to existing transactions table
  try {
    await db.exec(`ALTER TABLE transactions ADD COLUMN customer_id TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN discount_amount REAL DEFAULT 0`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN payment_method TEXT DEFAULT 'cash'`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN send_invoice BOOLEAN DEFAULT 0`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN discount_type TEXT DEFAULT 'flat'`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE transactions ADD COLUMN discount_percentage REAL DEFAULT 0`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  // ✅ Enhanced transaction_items table to support both services and products
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      item_type TEXT NOT NULL DEFAULT 'service',
      service_id TEXT,
      product_id TEXT,
      item_name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(service_id) REFERENCES services(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  // Add new columns to existing transaction_items table
  try {
    await db.exec(
      `ALTER TABLE transaction_items ADD COLUMN item_type TEXT DEFAULT 'service'`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(`ALTER TABLE transaction_items ADD COLUMN product_id TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(`ALTER TABLE transaction_items ADD COLUMN item_name TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Update existing transaction_items to populate item_name
  await db.exec(`
    UPDATE transaction_items 
    SET item_name = (
      SELECT s.name FROM services s WHERE s.id = transaction_items.service_id
    ) 
    WHERE item_name IS NULL AND service_id IS NOT NULL
  `);

  // ✅ User roles table for invoice visibility management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default users if they don't exist
  await db.run(`
    INSERT OR IGNORE INTO user_roles (id, username, role) 
    VALUES ('super-admin-1', 'admin', 'super_admin')
  `);
  await db.run(`
  INSERT OR IGNORE INTO users (id, username, password, role, full_name) 
  VALUES ('admin-1', 'admin', 'admin', 'admin', 'System Administrator')
`);
  await db.run(`
  INSERT OR IGNORE INTO users (id, username, password, role, full_name) 
  VALUES ('cashier-1', 'floki', 'floki', 'cashier', 'Cashier User')
`);

  await db.run(`
    INSERT OR IGNORE INTO user_roles (id, username, role) 
    VALUES ('financial-user-1', 'finance', 'financial')
  `);

  // Receipts table (enhanced)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      transaction_id TEXT,
      customer_name TEXT,
      customer_id TEXT,
      barber_name TEXT,
      service_date TEXT,
      total REAL,
      send_invoice BOOLEAN DEFAULT 0,
      created_at TEXT,
      FOREIGN KEY(transaction_id) REFERENCES transactions(id),
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `);

  // Add customer_id column to existing receipts
  try {
    await db.exec(`ALTER TABLE receipts ADD COLUMN customer_id TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Add send_invoice column to existing receipts
  try {
    await db.exec(
      `ALTER TABLE receipts ADD COLUMN send_invoice BOOLEAN DEFAULT 0`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  // ✅ Purchase Orders table for inventory management
  await db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      total_amount REAL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
  `);

  // ✅ Purchase Order Items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      FOREIGN KEY(purchase_order_id) REFERENCES purchase_orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      expense_date TEXT NOT NULL,
      expense_type TEXT DEFAULT 'general' CHECK (expense_type IN ('general', 'recurring')),
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`DROP TABLE IF EXISTS user_roles`);

  // ✅ Create indexes for better performance
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_bookings_barber ON bookings(barber_id)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_customer_visits_customer ON customer_visits(customer_id)`
  );

  console.log(
    "✅ SQLite DB initialized with enhanced inventory management and customer management features"
  );
  return db;
};

export default initDB;
