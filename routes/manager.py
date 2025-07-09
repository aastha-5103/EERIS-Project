from fastapi import APIRouter, HTTPException
from bson.objectid import ObjectId
from reportlab.pdfgen import canvas
import os
from db import list_transactions_by_employee, list_users


from db import (
    list_transactions_by_employee,
    update_transaction,
    get_budget_by_employee,
    update_budget,
    list_transactions,
    get_transaction_by_id,
    update_transaction_by_id,
    list_users,
    budgets
)
from db import get_employee_total_spending

router = APIRouter()

# ✅ Get summary for one employee
@router.get("/budget-summary/{email}")
def budget_summary(email: str):
    budget_data = get_budget_by_employee(email)
    if not budget_data:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget = budget_data.get("limit", 0)

    #  Calculate total spent
    total_spent = get_employee_total_spending(email)

    return {
        "budget": budget,
        "totalSpent": total_spent
    }




@router.patch("/status-by-transId")
def approve_by_transaction_id(data: dict):
    trans_id = data.get("transId")
    decision = data.get("decision")

    if not trans_id or decision not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid input")

    try:
        obj_id = ObjectId(trans_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid transaction ID")

    txn = get_transaction_by_id(obj_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_transaction_by_id(obj_id, {"status": decision})
    return {"message": f"Transaction {decision}"}


# ✅ Adjust budget (with guard to avoid underbudgeting)
# @router.patch("/adjust-budget/{employee_email}")
# def adjust_budget(employee_email: str, update: dict):
#     new_budget = update.get("budget")
#     if new_budget is None:
#         raise HTTPException(status_code=400, detail="Budget value required")

#     current_budget = get_budget_by_employee(employee_email)
#     if not current_budget:
#         raise HTTPException(status_code=404, detail="Employee budget not found")

#     total_spent = current_budget.get("spent", 0)
#     if new_budget < total_spent:
#         raise HTTPException(status_code=400, detail="New budget is below total spent")

#     update_budget(employee_email, {"allocated": new_budget})
#     return {"message": "Budget updated"}

@router.post("/employee_budgets")
def get_employee_budgets(data: dict):
    from db import list_users, get_budget_by_employee

    result = []
    seen_emails = set()

    for user in list_users():
        if user.get("role") != "Employee":
            continue

        email = user.get("email")
        if email in seen_emails:
            continue
        seen_emails.add(email)

        budget = get_budget_by_employee(email) or {}

        result.append({
            "empId": user.get("username"),         # keep this if needed for key
            "email": email,                        # ✅ ADD this line
            "employee": f"{user['firstName']} {user['lastName'][0]}.",
            "budget": budget.get("limit", 0)
        })

    return result





@router.patch("/adjust-budget")
def adjust_budget(data: dict):
    email = data.get("email")
    amount = data.get("amount")

    if not email or amount is None:
        raise HTTPException(status_code=400, detail="email and amount are required")

    update_budget(email, {"limit": float(amount)})
    return {"message": "Budget updated"}


@router.post("/fetch_transactions")
def fetch_transactions(data: dict):
    from db import list_transactions

    user_id = data.get("userId")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing userId")

    txns = list_transactions()
    result = []
    for txn in txns:
        if txn["status"] == "pending":  # Only those needing approval
            result.append({
                "transId": str(txn["_id"]),
                "date": txn["date"],
                "employee": txn["employee"].split("@")[0].title(),  # Just name part
                "amount": f"${txn['amount']}"
            })

    return result

from datetime import datetime

@router.post("/monthly_summary")
def monthly_summary(data: dict):
    from db import list_users, list_transactions_by_employee

    user_id = data.get("userId")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing userId")

    users = list_users()
    result = []

    for u in users:
        emp_email = u["email"]
        emp_txns = list_transactions_by_employee(emp_email)

        total = sum(t["amount"] for t in emp_txns if t.get("status") == "approved")

        if total > 0:
            result.append({
                "empId": u["username"],
                "date": datetime.now().strftime("%B"),  # e.g., April
                "employee": f"{u['firstName']} {u['lastName'][0]}.",
                "amount": f"${total}"
            })

    return result

 

@router.post("/generate_expense_report")
def generate_expense_report(data: dict):
    from reportlab.pdfgen import canvas
    from fastapi.responses import FileResponse
    from db import list_transactions_by_employee, list_users
    print(data)
    emp_id = data.get("empId")
    if not emp_id:
        raise HTTPException(status_code=400, detail="Missing employeeId")

    user = next((u for u in list_users() if u.get("username") == str(emp_id)), None)
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    email = user["email"]
    transactions = list_transactions_by_employee(email)

    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found for this employee")

    filename = f"expense_report_{emp_id}.pdf"
    c = canvas.Canvas(filename)
    c.drawString(100, 800, f"Expense Report for {user['firstName']} {user['lastName']}")
    y = 770
    for txn in transactions:
        date = txn.get("date", "Unknown Date")
        business = txn.get("business", "N/A")
        amount = txn.get("amount", "0")
        c.drawString(100, y, f"{date} - {business} - ${amount}")
        y -= 20
        if y < 50:
            c.showPage()
            y = 800

    c.save()
    return FileResponse(path=filename, filename=filename, media_type='application/pdf')
