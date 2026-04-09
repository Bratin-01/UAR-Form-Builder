"""
Form model — all reads and writes for the `forms` table.
PDF is stored as LONGBLOB; pass raw bytes when creating/updating.
"""
from database import get_db


def _row_to_dict(row, cursor):
    cols = [d[0] for d in cursor.description]
    return dict(zip(cols, row))


# ── reads ──────────────────────────────────────────────────────────────────────

def get_all_forms(include_pdf: bool = False):
    db  = get_db()
    cur = db.cursor()
    cols = "form_id, user_id, submitted_at, updated_at"
    if include_pdf:
        cols = "form_id, user_id, pdf_data, submitted_at, updated_at"
    cur.execute(f"SELECT {cols} FROM audit_forms ORDER BY submitted_at DESC")
    rows = [_row_to_dict(r, cur) for r in cur.fetchall()]
    cur.close()
    return rows


def get_forms_by_user(user_id: str, include_pdf: bool = False):
    db  = get_db()
    cur = db.cursor()
    cols = "form_id, user_id, submitted_at, updated_at"
    if include_pdf:
        cols = "form_id, user_id, pdf_data, submitted_at, updated_at"
    cur.execute(
        f"SELECT {cols} FROM audit_forms WHERE user_id = %s ORDER BY submitted_at DESC",
        (user_id,),
    )
    rows = [_row_to_dict(r, cur) for r in cur.fetchall()]
    cur.close()
    return rows


def get_form_by_id(form_id: int, include_pdf: bool = True):
    db  = get_db()
    cur = db.cursor()
    cols = "form_id, user_id, submitted_at, updated_at"
    if include_pdf:
        cols = "form_id, user_id, pdf_data, submitted_at, updated_at"
    cur.execute(f"SELECT {cols} FROM audit_forms WHERE form_id = %s", (form_id,))
    row = cur.fetchone()
    cur.close()
    return _row_to_dict(row, cur) if row else None


# ── writes ─────────────────────────────────────────────────────────────────────

from datetime import datetime

def create_form(user_id: str, pdf_data: bytes = None) -> str:
    db  = get_db()
    cur = db.cursor()

    # Build date part: ddmmyyyy
    date_part = datetime.now().strftime("%d%m%Y")

    # Find how many forms already submitted today
    cur.execute(
        "SELECT COUNT(*) FROM audit_forms WHERE DATE(submitted_at) = CURDATE()"
    )
    serial = cur.fetchone()[0] + 1

    # Pad serial to 3 digits
    serial_part = str(serial).zfill(3)

    # Final ID
    new_id = f"{date_part}{serial_part}"

    # Insert with custom ID
    cur.execute(
        "INSERT INTO audit_forms (form_id, user_id, pdf_data) VALUES (%s, %s, %s)",
        (new_id, user_id, pdf_data),
    )
    db.commit()
    cur.close()
    return new_id



def update_form_pdf(form_id: int, pdf_data: bytes) -> bool:
    db  = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE audit_forms SET pdf_data = %s WHERE form_id = %s",
        (pdf_data, form_id),
    )
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed


def delete_form(form_id: int) -> bool:
    db  = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM audit_forms WHERE form_id = %s", (form_id,))
    db.commit()
    changed = cur.rowcount > 0
    cur.close()
    return changed