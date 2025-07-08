from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from db import (
    add_receipt, get_receipt_by_id, list_receipts,
    list_receipts_by_owner, update_receipt, delete_receipt,
    add_transaction, get_transaction_by_id
)
import uuid
import json
from datetime import datetime
from PIL import Image
import pytesseract
import io
import re
import easyocr
import openai
import base64
import os
from openai import OpenAI

client = OpenAI(api_key="") #API KEY
router = APIRouter()
reader = easyocr.Reader(['en'], gpu=False)  # Use CPU

@router.post("/upload-image")
async def upload_receipt_image(
    file: UploadFile = File(...),
    userId: str = Form(...)
):
    try:
        contents = await file.read()
        b64_image = base64.b64encode(contents).decode("utf-8")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Extract the business name, total amount (use the highest price), and the date "
                                "in the format MM/DD/YYYY from this receipt. Return this exactly:\n"
                                "{\n  \"business\": \"...\",\n  \"date\": \"...\",\n  \"amount\": 0.00\n}"
                            )
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{b64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        raw_output = response.choices[0].message.content
        print("GPT-4o Raw Output:\n", raw_output)

        # Clean out markdown fencing (```json ... ```)
        cleaned = raw_output.strip().strip("```").replace("json", "").strip()

        parsed_data = json.loads(cleaned)

        return {
            "parsed": parsed_data,
            "userId": userId,
            "image_base64": b64_image   # ✅ send image base64 to frontend
        }

    except Exception as e:
        print("❌ GPT-4o Error:", e)
        raise HTTPException(status_code=500, detail=f"GPT-4o parsing failed: {str(e)}")
    
# ✅ [2] FINAL FORM SUBMISSION: Save receipt and transaction (manual or image-based)
@router.post("/upload")
async def upload_receipt(request: Request):
    print("\n--- Received request for /upload ---")
    try:
        data = await request.json()
        print(f"DEBUG: Received data: {data}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {e}")

    receipt_data = data.copy()

    owner_email = receipt_data.get("userId")
    if not owner_email:
        raise HTTPException(status_code=400, detail="Missing userId")
    receipt_data["owner"] = receipt_data.pop("userId")

    if "amount" in receipt_data:
        try:
            receipt_data["total"] = float(receipt_data.pop("amount"))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid amount format")
    else:
        raise HTTPException(status_code=400, detail="Missing amount")

    # New: Optional base64 image (if provided)
    image_base64 = receipt_data.pop("image_base64", None)
    if image_base64:
        receipt_data["image_base64"] = image_base64

    required_receipt_fields = ["owner", "business", "date", "total", "category"]
    missing_fields = [f for f in required_receipt_fields if f not in receipt_data]
    if missing_fields:
        raise HTTPException(status_code=400, detail=f"Missing fields for receipt: {', '.join(missing_fields)}")

    receipt_id = str(uuid.uuid4())
    receipt_data["receipt_id"] = receipt_id
    receipt_data["status"] = "processed"

    try:
        receipt_result = add_receipt(receipt_data)
        if not receipt_result.inserted_id:
            raise Exception("Failed to insert receipt")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add receipt: {e}")

    # Transaction creation (same as before)
    transaction_data = {
        "employee": owner_email,
        "receipt_id": receipt_id,
        "amount": receipt_data["total"],
        "status": "pending",
        "date": receipt_data["date"],
        "business": receipt_data["business"],
        "category": receipt_data["category"]
    }

    try:
        transaction_result = add_transaction(transaction_data)
        if not transaction_result.inserted_id:
            raise Exception("Failed to insert transaction")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Receipt added, but failed to add transaction: {e}")

    return {
        "message": "Receipt and transaction submitted successfully",
        "receipt_inserted_id": str(receipt_result.inserted_id),
        "transaction_inserted_id": str(transaction_result.inserted_id),
        "receipt_id": receipt_id
    }



# ✅ View all receipts by employee (email as owner)
@router.get("/employee/{owner_email}")
def get_employee_receipts(owner_email: str):
    results = list_receipts_by_owner(owner_email)
    for r in results:
        r["_id"] = str(r["_id"])
    return results


# ✅ View one receipt
@router.get("/{receipt_id}")
def get_receipt(receipt_id: str):
    receipt = get_receipt_by_id(receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Not found")
    receipt["_id"] = str(receipt["_id"])
    return receipt


# ✅ Update receipt (can be used for OCR cleanup)
@router.patch("/{receipt_id}")
def edit_receipt(receipt_id: str, updates: dict):
    update_receipt(receipt_id, updates)
    return {"message": "Updated"}


# ✅ Delete a receipt
@router.delete("/{receipt_id}")
def delete(receipt_id: str):
    delete_receipt(receipt_id)
    return {"message": "Deleted"}
