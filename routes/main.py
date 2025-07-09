from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from receipts import router as receipts_router
from transactions import router as transactions_router
from manager import router as manager_router
from hr import router as hr_router



app = FastAPI()

# ✅ Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(receipts_router, prefix="/api/receipts", tags=["Receipts"])
app.include_router(transactions_router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(manager_router, prefix="/api/manager", tags=["Manager"])
app.include_router(hr_router, prefix="/api/hr", tags=["HR"])

@app.get("/")
def root():
    return {"message": "EERIS backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
