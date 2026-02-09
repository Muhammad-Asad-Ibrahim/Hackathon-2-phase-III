from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from src.database import get_db
from src.models.tool_definition import ToolDefinition
from src.services.auth import get_current_user
from src.models.user import User


router = APIRouter(prefix="/tools", tags=["tools"])


@router.get("/", response_model=dict)
async def get_available_tools(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve the available tools that the AI can use.
    """
    try:
        # Query all tool definitions from the database
        tools_query = db.query(ToolDefinition).all()
        
        tools_list = []
        for tool in tools_query:
            tools_list.append({
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.input_schema,
                "output_schema": tool.output_schema
            })
        
        return {
            "tools": tools_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving tools: {str(e)}")