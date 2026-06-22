from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from dotenv import load_dotenv
import asyncio
from contextlib import asynccontextmanager
from app.core.watcher import start_watcher

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    observer = start_watcher(loop)
    yield
    observer.stop()
    observer.join()

app = FastAPI(title="ForgeMind AI API", version="1.0.0", lifespan=lifespan)

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok"}
