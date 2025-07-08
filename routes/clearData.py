from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["eeris_db"]

db.users.delete_many({})
db.receipts.delete_many({})
db.transactions.delete_many({})
db.budgets.delete_many({})

print("✅ All collections cleared.")