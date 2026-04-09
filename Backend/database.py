from dotenv import load_dotenv
load_dotenv()                    # must run before os.getenv() calls below

import os
from flask import g
from mysql.connector import pooling

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", ""),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", ""),
}

_pool = pooling.MySQLConnectionPool(
    pool_name="lims_pool",
    pool_size=5,
    **DB_CONFIG,
)


def get_db():
    if "db" not in g:
        g.db = _pool.get_connection()
    return g.db


def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)


def init_db():
    conn = _pool.get_connection()
    cur  = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id    VARCHAR(50)  NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name  VARCHAR(100) NOT NULL,
            email      VARCHAR(150) NOT NULL,
            password   VARCHAR(255) NOT NULL,
            role       VARCHAR(50)  NOT NULL DEFAULT 'User',
            is_enabled BOOLEAN      NOT NULL DEFAULT TRUE,
            created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id),
            UNIQUE KEY email (email)
        ) 
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS audit_forms (
        form_id      VARCHAR(20) NOT NULL PRIMARY KEY,
        user_id      VARCHAR(50) NOT NULL,
        pdf_data     LONGBLOB,
        submitted_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
            ON DELETE CASCADE ON UPDATE CASCADE
    )
""")

    cur.execute("""
        CREATE TABLE IF NOT EXISTS form_edits (
            edit_id    INT         AUTO_INCREMENT PRIMARY KEY,
            form_id    INT         NOT NULL,
            user_id    VARCHAR(50) NOT NULL,
            comment    TEXT        NOT NULL,
            created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (form_id) REFERENCES forms(form_id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
                ON DELETE CASCADE ON UPDATE CASCADE
        )
    """)

    conn.commit()
    cur.close()
    conn.close()