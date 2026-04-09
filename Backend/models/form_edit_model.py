"""
Form-edit model — all reads and writes for the `form_edits` table.
Each row is one comment/audit entry tied to a form and a user.
"""
from database import get_db


def _row_to_dict(row, cursor):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


# ── reads ──────────────────────────────────────────────────────────────────────

def get_edits_by_form(form_id: int):
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT edit_id, form_id, user_id, comment, created_at "
        "FROM form_edits WHERE form_id = %s ORDER BY created_at DESC",
        (form_id,),
    )
    rows = [_row_to_dict(r, cur) for r in cur.fetchall()]
    cur.close()
    return rows


def get_edits_by_user(user_id: str):
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT edit_id, form_id, user_id, comment, created_at "
        "FROM form_edits WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,),
    )
    rows = [_row_to_dict(r, cur) for r in cur.fetchall()]
    cur.close()
    return rows


def get_edit_by_id(edit_id: int):
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT edit_id, form_id, user_id, comment, created_at "
        "FROM form_edits WHERE edit_id = %s",
        (edit_id,),
    )
    row = cur.fetchone()
    cur.close()
    return _row_to_dict(row, cur) if row else None


# ── writes ─────────────────────────────────────────────────────────────────────

def add_edit(form_id: int, user_id: str, comment: str) -> int:
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO form_edits (form_id, user_id, comment) VALUES (%s, %s, %s)",
        (form_id, user_id, comment),
    )
    db.commit()
    new_id = cur.lastrowid
    cur.close()
    return new_id


def delete_edit(edit_id: int) -> bool:
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM form_edits WHERE edit_id = %s", (edit_id,))
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed


def delete_edits_by_form(form_id: int) -> int:
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM form_edits WHERE form_id = %s", (form_id,))
    db.commit()
    count = cur.rowcount
    cur.close()
    return count