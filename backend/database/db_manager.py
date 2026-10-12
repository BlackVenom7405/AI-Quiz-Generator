import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'quiz_genius.db')
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schema.sql')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    if not os.path.exists(SCHEMA_PATH):
        raise FileNotFoundError(f"Schema file not found at: {SCHEMA_PATH}")

    with get_db_connection() as conn:
        with open(SCHEMA_PATH, 'r') as f:
            conn.executescript(f.read())
        conn.commit()
    
    # Seed a default admin user if not present
    seed_admin()

def seed_admin():
    admin_email = "admin@quizgenius.ai"
    user = query_db("SELECT * FROM users WHERE email = ?", (admin_email,), one=True)
    if not user:
        print("Seeding default admin user...")
        hashed_password = generate_password_hash("admin123")
        execute_db(
            "INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)",
            ("Admin Genius", admin_email, hashed_password, 1)
        )
        print("Admin user seeded successfully. Login: admin@quizgenius.ai / admin123")

def query_db(query, args=(), one=False):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        rv = cursor.fetchall()
        # Convert sqlite3.Row to dict
        result = [dict(row) for row in rv]
        return (result[0] if result else None) if one else result
    finally:
        cursor.close()
        conn.close()

def execute_db(query, args=()):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        conn.commit()
        return cursor.rowcount
    finally:
        cursor.close()
        conn.close()

def insert_db(query, args=()):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query, args)
        conn.commit()
        return cursor.lastrowid
    finally:
        cursor.close()
        conn.close()
