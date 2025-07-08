from fastapi import APIRouter, HTTPException
from db import add_user, delete_user, list_users, get_user_by_email

router = APIRouter()

@router.post("/add_employee")
def add_employee(data: dict):
    from db import add_user, add_budget, delete_budget

    required_fields = ["firstName", "lastName", "email", "budget", "username", "role"]
    if not all(field in data for field in required_fields):
        raise HTTPException(status_code=400, detail="Missing required fields")

    username = data["username"]
    email = data["email"]

    # ✅ Check for existing user
    existing_user = next((u for u in list_users() if u.get("username") == username), None)

    if existing_user:
        # 🔥 Delete user and their budget if they exist
        delete_user(username)
        delete_budget(email)

    user_data = {
        "username": data["username"],
        "email": data["email"],
        "firstName": data["firstName"],
        "lastName": data["lastName"],
        "role": data["role"],
        "password": "temp123"  # default, since frontend doesn’t supply it
    }

    budget_data = {
        "employee": data["email"],
        "limit": float(data["budget"]),
        "remaining": float(data["budget"]),
        "department": "General"
    }

    add_user(user_data)
    add_budget(budget_data)
    return {"message": "Employee and budget added successfully"}


# ✅ List all employees only
@router.post("/list_employees")
def list_employees(data: dict):
    from db import list_users, get_budget_by_employee

    users = list_users()
    result = []

    for user in users:
        if user.get("role") == "Manager" or user.get("role") == "Employee":
            budget = get_budget_by_employee(user["email"]) or {}
            result.append({
                "username": user.get("username"),
                "employee": user.get("email"),
                "role": user.get("role"),
                "firstName": user.get("firstName"),
                "lastName": user.get("lastName"),
                "budget": budget.get("limit", 0)
            })

    return result



@router.post("/delete_employee")
def delete_employee(data: dict):
    from db import list_users, delete_user, budgets

    emp_id = data.get("username")
    if not emp_id:
        raise HTTPException(status_code=400, detail="Missing empId")

    # Find user by empId
    user = next((u for u in list_users() if str(u.get("username")) == str(emp_id)), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    email = user["email"]
    delete_user(emp_id)
    budgets.delete_one({"employee": email})

    return {"message": f"Deleted employee {emp_id} ({email})"}




@router.patch("/update_employee")
def update_employee(data: dict):
    from db import update_user, update_budget

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Missing email")

    update_user(email, {
        "firstName": data["firstName"],
        "lastName": data["lastName"],
        "username": data["username"],
        "role": data["role"]
    })

    update_budget(email, {
        "allocated": float(data["budget"])
    })

    return {"message": f"Employee {email} updated successfully"}
