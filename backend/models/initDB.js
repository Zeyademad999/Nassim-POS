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
    icon TEXT,
    description TEXT
  )
`);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      specialty_ids TEXT


    )
  `);

  // Add mobile and specialty columns if they don't exist (for existing databases)
  try {
    await db.exec(`ALTER TABLE barbers ADD COLUMN mobile TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  try {
    await db.exec(
      `ALTER TABLE barbers RENAME COLUMN specialty TO specialty_text_backup`
    );
  } catch (err) {
    // Column doesn't exist or already renamed, ignore
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
  await db.exec(` CREATE TABLE IF NOT EXISTS barber_schedules (
  id TEXT PRIMARY KEY,
  barber_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, 2=Tuesday, etc.
  start_time TEXT NOT NULL, -- Format: "09:00"
  end_time TEXT NOT NULL, -- Format: "18:00"
  is_working BOOLEAN DEFAULT 1, -- TRUE if working this day
  break_start TEXT, -- Optional break time start "13:00"
  break_end TEXT, -- Optional break time end "14:00"
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(barber_id) REFERENCES barbers(id) ON DELETE CASCADE
);  `);

  await db.exec(` CREATE TABLE IF NOT EXISTS barber_time_off (
  id TEXT PRIMARY KEY,
  barber_id TEXT NOT NULL,
  start_date TEXT NOT NULL, -- Format: "2025-08-10"
  end_date TEXT NOT NULL, -- Format: "2025-08-15"
  reason TEXT, -- "Vacation", "Sick Leave", "Personal"
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(barber_id) REFERENCES barbers(id) ON DELETE CASCADE
); `);

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

  try {
    await db.exec(`ALTER TABLE expenses ADD COLUMN recurrence_period INTEGER`);
  } catch {}

  try {
    await db.exec(`ALTER TABLE expenses ADD COLUMN next_due_date TEXT`);
  } catch {}

  // Add send_invoice column to existing receipts
  try {
    await db.exec(
      `ALTER TABLE receipts ADD COLUMN send_invoice BOOLEAN DEFAULT 0`
    );
  } catch (err) {
    // Column already exists, ignore
  }

  // Add this after the existing ALTER TABLE statements for barbers
  try {
    await db.exec(`ALTER TABLE barbers ADD COLUMN specialty_ids TEXT`);
    console.log("✅ Added specialty_ids column to barbers table");
  } catch (err) {
    // Column already exists, ignore
    console.log("specialty_ids column already exists or error:", err.message);
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

  // Add this after your existing table creations
  // Add this after your existing table creations
  await db.exec(`
  CREATE TABLE IF NOT EXISTS expense_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  // Add these sections to your existing initDB.js file after your existing table creations:

  // ✅ Tax Settings table to store configurable tax rates
  await db.exec(`
  CREATE TABLE IF NOT EXISTS tax_settings (
    id TEXT PRIMARY KEY,
    tax_name TEXT NOT NULL,
    tax_rate REAL NOT NULL DEFAULT 0,
    is_enabled BOOLEAN DEFAULT 1,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  // ✅ General Settings table for other system configurations
  await db.exec(`
  CREATE TABLE IF NOT EXISTS general_settings (
    id TEXT PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type TEXT DEFAULT 'text',
    description TEXT,
    category TEXT DEFAULT 'general',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

  // Insert default tax setting if it doesn't exist
  await db.run(`
  INSERT OR IGNORE INTO tax_settings (id, tax_name, tax_rate, is_enabled, description) 
  VALUES ('default-tax-1', 'VAT', 8.0, 1, 'Default Value Added Tax')
`);

  // Insert default general settings
  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-1', 'business_name', 'Nassim Select Barber', 'text', 'Business name displayed on receipts', 'business')
`);

  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-2', 'business_address', 'The Fount Mall, Abdallah Ibn Salamah, First New Cairo, Egypt', 'text', 'Business address', 'business')
`);

  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-3', 'business_phone', '+20 100 016 6364', 'text', 'Business phone number', 'business')
`);

  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-4', 'business_email', 'lebanon_nassim@hotmail.com', 'text', 'Business email address', 'business')
`);

  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-5', 'currency_symbol', 'EGP', 'text', 'Currency symbol for display', 'financial')
`);

  await db.run(`
  INSERT OR IGNORE INTO general_settings (id, setting_key, setting_value, setting_type, description, category) 
  VALUES ('setting-6', 'default_tax_enabled', 'true', 'boolean', 'Enable default tax calculation', 'financial')
`);

  // Add indexes for better performance
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tax_settings_enabled ON tax_settings(is_enabled)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_general_settings_key ON general_settings(setting_key)`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_general_settings_category ON general_settings(category)`
  );

  console.log("✅ Tax and general settings tables created successfully");

  // Also add the category column to expenses table if it doesn't exist
  try {
    await db.exec(`ALTER TABLE expenses ADD COLUMN category TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  await db.exec(`DROP TABLE IF EXISTS user_roles`);

  // ✅ Create indexes for better performance
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date)`
  );

  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_barber_schedules_barber ON barber_schedules(barber_id)`
  );
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_barber_schedules_day ON barber_schedules(day_of_week);
`);
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_barber_time_off_barber ON barber_time_off(barber_id);
`
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_barber_time_off_dates ON barber_time_off(start_date, end_date);`
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
  try {
    await db.exec(`ALTER TABLE services ADD COLUMN description TEXT`);
  } catch (err) {
    // Column already exists
  }

  console.log(
    "✅ SQLite DB initialized with enhanced inventory management and customer management features"
  );
  return db;
};

export default initDB;
