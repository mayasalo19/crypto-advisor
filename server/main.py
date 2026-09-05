from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import modular routers
from routers.auth import router as auth_router
from routers.preferences import router as preferences_router
from routers.market import router as market_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Crypto Advisor API")

# Setup CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route
@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Server is running!"}

# Register routers
app.include_router(auth_router)
app.include_router(preferences_router)
app.include_router(market_router)