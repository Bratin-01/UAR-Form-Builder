from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io

from database import init_app, init_db
from models.user_model      import (get_all_users, get_user_by_user_id,
                                     create_user, update_user, delete_user,
                                     verify_password)
from models.form_model      import (get_all_forms, get_forms_by_user,
                                     get_form_by_id, create_form,
                                     update_form_pdf, delete_form)
from models.form_edit_model import (get_edits_by_form, get_edits_by_user,
                                     add_edit, delete_edit)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
init_app(app)

with app.app_context():
    init_db()


def ok(data=None, status=200):
    return jsonify({"success": True,  "data": data}), status

def err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login")
def login():
    body     = request.get_json(force=True)
    user_id  = body.get("user_id", "").strip()
    password = body.get("password", "")
    if not user_id or not password:
        return err("user_id and password are required")
    if not verify_password(user_id, password):
        return err("Invalid credentials", 401)
    return ok(get_user_by_user_id(user_id))


# ═══════════════════════════════════════════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/users")
def list_users():
    return ok(get_all_users())


@app.get("/api/users/<string:user_id>")
def get_user(user_id):
    user = get_user_by_user_id(user_id)
    if not user:
        return err("User not found", 404)
    return ok(user)


@app.post("/api/users")
def add_user():
    body     = request.get_json(force=True)
    required = ("first_name", "last_name", "user_id", "email", "password")
    missing  = [f for f in required if not body.get(f)]
    if missing:
        return err(f"Missing fields: {', '.join(missing)}")
    new_id = create_user(
        first_name = body["first_name"],
        last_name  = body["last_name"],
        user_id    = body["user_id"],
        email      = body["email"],
        password   = body["password"],
        role       = body.get("role", "User"),
    )
    return ok({"user_id": new_id}, 201)


@app.put("/api/users/<string:user_id>")
def edit_user(user_id):
    body    = request.get_json(force=True)
    changed = update_user(user_id, **body)
    if not changed:
        return err("User not found or nothing changed", 404)
    return ok({"updated": user_id})


@app.delete("/api/users/<string:user_id>")
def remove_user(user_id):
    if not delete_user(user_id):
        return err("User not found", 404)
    return ok({"deleted": user_id})


# ═══════════════════════════════════════════════════════════════════════════════
# FORMS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/forms")
def list_forms():
    user_id = request.args.get("user_id")
    if user_id:
        return ok(get_forms_by_user(user_id))
    return ok(get_all_forms())


@app.get("/api/forms/<string:form_id>")
def get_form(form_id):
    form = get_form_by_id(form_id, include_pdf=False)
    if not form:
        return err("Form not found", 404)
    return ok(form)


@app.get("/api/forms/<string:form_id>/pdf")
def download_form_pdf(form_id):
    form = get_form_by_id(form_id, include_pdf=True)
    if not form:
        return err("Form not found", 404)
    if not form.get("pdf_data"):
        return err("No PDF attached to this form", 404)
    return send_file(
        io.BytesIO(form["pdf_data"]),
        mimetype="application/pdf",
        as_attachment=False,
        download_name=f"form_{form_id}.pdf",
    )


@app.post("/api/forms")
def submit_form():
    user_id = request.form.get("user_id", "").strip()
    if not user_id:
        return err("user_id is required")
    if "pdf" not in request.files:
        return err("pdf file is required")
    pdf_bytes = request.files["pdf"].read()
    form_id   = create_form(user_id, pdf_bytes)  # now returns a string ID
    return ok({"form_id": form_id}, 201)


@app.put("/api/forms/<string:form_id>/pdf")
def replace_pdf(form_id):
    if "pdf" not in request.files:
        return err("No PDF file provided")
    changed = update_form_pdf(form_id, request.files["pdf"].read())
    if not changed:
        return err("Form not found", 404)
    return ok({"updated": form_id})


@app.delete("/api/forms/<string:form_id>")
def remove_form(form_id):
    if not delete_form(form_id):
        return err("Form not found", 404)
    return ok({"deleted": form_id})


# ═══════════════════════════════════════════════════════════════════════════════
# FORM EDITS / COMMENTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/forms/<string:form_id>/edits")
def list_form_edits(form_id):
    return ok(get_edits_by_form(form_id))


@app.post("/api/forms/<string:form_id>/edits")
def add_form_edit(form_id):
    body    = request.get_json(force=True)
    user_id = body.get("user_id", "").strip()
    comment = body.get("comment", "").strip()
    if not user_id or not comment:
        return err("user_id and comment are required")
    edit_id = add_edit(form_id, user_id, comment)
    return ok({"edit_id": edit_id}, 201)


@app.delete("/api/forms/<string:form_id>/edits/<int:edit_id>")
def remove_edit(form_id, edit_id):
    if not delete_edit(edit_id):
        return err("Edit not found", 404)
    return ok({"deleted": edit_id})


@app.get("/api/users/<string:user_id>/edits")
def list_user_edits(user_id):
    return ok(get_edits_by_user(user_id))


# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(debug=True, port=5000)
