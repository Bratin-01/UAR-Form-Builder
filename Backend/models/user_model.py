"""
User model — all reads and writes for the `users` table.
"""
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db


def _row_to_dict(row, cursor):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


# ── reads ──────────────────────────────────────────────────────────────────────

def get_all_users():
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT user_id, first_name, last_name, email, role, is_enabled, "
        "created_at, updated_at "
        "FROM users ORDER BY created_at DESC"
    )
    rows = [_row_to_dict(r, cur) for r in cur.fetchall()]
    cur.close()
    return rows


def get_user_by_user_id(user_id: str):
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT user_id, first_name, last_name, email, role, is_enabled, "
        "created_at, updated_at "
        "FROM users WHERE user_id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    return _row_to_dict(row, cur) if row else None


def get_user_by_email(email: str):
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT user_id, first_name, last_name, email, role, is_enabled, "
        "created_at, updated_at "
        "FROM users WHERE email = %s",
        (email,),
    )
    row = cur.fetchone()
    cur.close()
    return _row_to_dict(row, cur) if row else None


# ── auth ───────────────────────────────────────────────────────────────────────

def verify_password(user_id: str, plain_password: str) -> bool:
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT password, is_enabled FROM users WHERE user_id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return False
    stored_password, is_enabled = row
    if not is_enabled:
        return False
    return check_password_hash(stored_password, plain_password)


# ── writes ─────────────────────────────────────────────────────────────────────

def create_user(first_name: str, last_name: str, user_id: str,
                email: str, password: str, role: str = "User") -> str:
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO users (user_id, first_name, last_name, email, password, role) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (user_id, first_name, last_name, email,
         generate_password_hash(password), role),
    )
    db.commit()
    cur.close()
    return user_id


def update_user(user_id: str, **fields) -> bool:
    allowed = {"first_name", "last_name", "email", "role"}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if "password" in fields:
        updates["password"] = generate_password_hash(fields["password"])
    if not updates:
        return False
    set_clause = ", ".join(f"{col} = %s" for col in updates)
    vals       = list(updates.values()) + [user_id]
    db  = get_db()
    cur = db.cursor()
    cur.execute(f"UPDATE users SET {set_clause} WHERE user_id = %s", vals)
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed


def disable_user(user_id: str) -> bool:
    """Set is_enabled = FALSE — soft disables the user account."""
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET is_enabled = FALSE WHERE user_id = %s",
        (user_id,),
    )
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed


def enable_user(user_id: str) -> bool:
    """Set is_enabled = TRUE — re-activates a disabled user account."""
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET is_enabled = TRUE WHERE user_id = %s",
        (user_id,),
    )
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed


def delete_user(user_id: str) -> bool:
    """Hard delete — permanently removes the user and all related records."""
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed