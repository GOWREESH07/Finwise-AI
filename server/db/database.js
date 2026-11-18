const Database = require('better-sqlite3');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'finwise.db');

// Create database instance
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 * Creates all required tables if they don't exist
 */
function initializeDB() {
  console.log('Initializing database...');

  // Check and add missing columns to existing tables (migration)
  try {
    const tableInfo = db.prepare("PRAGMA table_info(financial_profiles)").all();
    const hasAllocationsColumn = tableInfo.some(col => col.name === 'investment_allocations');
    
    if (!hasAllocationsColumn) {
      console.log('Adding investment_allocations column to financial_profiles...');
      db.exec(`ALTER TABLE financial_profiles ADD COLUMN investment_allocations TEXT DEFAULT '[]'`);
      console.log('Column added successfully');
    }
  } catch (err) {
    console.log('Migration check skipped (table may not exist yet)');
  }

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER,
      profession TEXT,
      country TEXT DEFAULT 'India',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Financial profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      primary_income REAL DEFAULT 0,
      other_income TEXT DEFAULT '[]',
      expenses TEXT DEFAULT '{}',
      risk_appetite TEXT DEFAULT 'medium',
      investment_horizon TEXT DEFAULT 'long',
      investment_types TEXT DEFAULT '[]',
      investment_allocations TEXT DEFAULT '[]',
      monthly_budget REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // AI Analysis results table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      analysis TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Email preferences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      subscribed INTEGER DEFAULT 1,
      send_time TEXT DEFAULT '08:00',
      timezone TEXT DEFAULT 'Asia/Kolkata',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Email logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT,
      status TEXT DEFAULT 'sent',
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
}

module.exports = {
  db,
  initializeDB
};
