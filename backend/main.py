from fastapi import FastAPI
from src.api.v1.chat_router import router as chat_router
from src.api.v1.tool_router import router as tool_router
from src.api.tasks import router as tasks_router
from src.api.auth import router as auth_router

app = FastAPI()

# Include the routers
app.include_router(tasks_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api/v1/chat")     # ← /api/v1 → /api/chat
app.include_router(tool_router, prefix="/api/v1/tools")

@app.get("/")
def read_root():
    return {"Hello": "World"}