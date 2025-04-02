from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.calendar_dynamodb.calendar_api import router as calendar_router
from services.messages_dynamodb.message_api import router as message_router
from services.call_manager.call_manager_api import router as call_manager_router
from services.billing.billing_api import router as billing_router
from services.payments.payments_api import router as payments_router
from services.ai_assistant.ai_assistant_api import router as ai_assistant_router
import uvicorn
import os

app = FastAPI(title="TheraFlow API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", 
                   "http://localhost:3002", "http://localhost:3003",
                   "http://localhost:3004", "http://localhost:3005", 
                   "http://localhost:3006", "http://localhost:3007",
                   "https://app.therastack.com", "https://api.therastack.com"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(calendar_router)
app.include_router(message_router)
app.include_router(call_manager_router)
app.include_router(billing_router)
app.include_router(payments_router)
app.include_router(ai_assistant_router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to TheraFlow API"}

# Health check endpoint for deployment verification
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "0.1.0", "service": "TheraStack API"}

# For local development
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)