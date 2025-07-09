from pymongo import MongoClient
from bson.objectid import ObjectId

# ====== DATABASE CONNECTION ======
client = MongoClient("mongodb://localhost:27017")
db = client["eeris_db"]

# ====== COLLECTIONS ======
users = db["users"]
receipts = db["receipts"]
transactions = db["transactions"]
budgets = db["budgets"]

# ====== USERS ======
def add_user(data): return users.insert_one(data)
def get_user_by_username(username): return users.find_one({"username": username})
def get_user_by_email(email): return users.find_one({"email": email})  # ✅ Added for auth.py
def list_users(): return list(users.find())
def update_user(username, new_data): return users.update_one({"username": username}, {"$set": new_data})
def delete_user(username): return users.delete_one({"username": username})

# ====== RECEIPTS ======
def add_receipt(data): return receipts.insert_one(data)

def get_receipt_by_id(receipt_id):
    return receipts.find_one({"receipt_id": receipt_id})


def list_receipts(): return list(receipts.find())
def list_receipts_by_owner(owner): return list(receipts.find({"owner": owner}))
def update_receipt(receipt_id, new_data): return receipts.update_one({"receipt_id": receipt_id}, {"$set": new_data})
def delete_receipt(receipt_id): return receipts.delete_one({"receipt_id": receipt_id})

# ====== TRANSACTIONS ======
def add_transaction(data): return transactions.insert_one(data)
def get_transaction_by_id(receipt_id):
    # Try matching receipt_id field first
    txn = transactions.find_one({"receipt_id": receipt_id})
    if txn:
        return txn
    # If not found, try _id field
    try:
        txn = transactions.find_one({"_id": ObjectId(receipt_id)})
        return txn
    except:
        return None


def list_transactions(): return list(transactions.find())
def list_transactions_by_employee(email): return list(transactions.find({"employee": email}))  # 🛠 used in receipts.py
def list_pending_transactions(): return list(transactions.find({"status": "pending"}))
from bson import ObjectId

def update_transaction(receipt_id, new_data):
    print("✅ Updating transaction by receipt_id:", receipt_id)
    return transactions.update_one({ "receipt_id": receipt_id }, { "$set": new_data })

def update_transaction_by_id(_id, new_data): return transactions.update_one({"_id": _id}, {"$set": new_data})
def delete_transaction(receipt_id): return transactions.delete_one({"receipt_id": receipt_id})
def list_transactions_by_department(dept_name): return list(transactions.find({"department": dept_name}))

# ====== BUDGETS ======
def add_budget(data): return budgets.insert_one(data)
def get_budget_by_employee(email): return budgets.find_one({"employee": email})  # 🛠 standardized on email
def list_budgets(): return list(budgets.find())
def update_budget(email, new_data): 
    return budgets.update_one({"employee": email}, {"$set": new_data}, upsert=True)
def delete_budget(email): return budgets.delete_one({"employee": email})
def get_employee_total_spending(email):
    return sum(txn.get("amount", 0) for txn in transactions.find({
        "employee": email,

    }))

