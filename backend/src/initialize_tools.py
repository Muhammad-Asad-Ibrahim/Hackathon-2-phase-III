import asyncio
import json
import sys
import os
from sqlalchemy.orm import Session

# Add the parent directory to the path so we can import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal
from models.tool_definition import ToolDefinition


def initialize_tool_definitions():
    """
    Initialize the database with the required tool definitions.
    """
    db = SessionLocal()
    
    try:
        # Check if tools already exist
        existing_tools = db.query(ToolDefinition).count()
        if existing_tools > 0:
            print("Tool definitions already exist in the database.")
            return
        
        # Define the required tools
        tools_data = [
            {
                "name": "create_task",
                "description": "Create a new task with the provided details",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Title of the task"},
                        "description": {"type": "string", "description": "Detailed description of the task"},
                        "due_date": {"type": "string", "format": "date", "description": "Due date for the task"},
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}
                    },
                    "required": ["title"]
                },
                "output_schema": {
                    "type": "object",
                    "properties": {
                        "success": {"type": "boolean"},
                        "task_id": {"type": "string", "description": "ID of the created task"},
                        "message": {"type": "string", "description": "Result message"}
                    }
                },
                "endpoint_mapping": "/api/tasks"
            },
            {
                "name": "update_task",
                "description": "Update an existing task with new details",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "ID of the task to update"},
                        "title": {"type": "string", "description": "New title of the task"},
                        "description": {"type": "string", "description": "New description of the task"},
                        "due_date": {"type": "string", "format": "date", "description": "New due date for the task"},
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed"]}
                    },
                    "required": ["task_id"]
                },
                "output_schema": {
                    "type": "object",
                    "properties": {
                        "success": {"type": "boolean"},
                        "message": {"type": "string", "description": "Result message"}
                    }
                },
                "endpoint_mapping": "/api/tasks/{task_id}"
            },
            {
                "name": "delete_task",
                "description": "Delete an existing task",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "task_id": {"type": "string", "description": "ID of the task to delete"}
                    },
                    "required": ["task_id"]
                },
                "output_schema": {
                    "type": "object",
                    "properties": {
                        "success": {"type": "boolean"},
                        "message": {"type": "string", "description": "Result message"}
                    }
                },
                "endpoint_mapping": "/api/tasks/{task_id}"
            },
            {
                "name": "list_tasks",
                "description": "Retrieve a list of tasks based on filters",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "status": {"type": "string", "enum": ["pending", "in-progress", "completed", "all"]},
                        "limit": {"type": "integer", "minimum": 1, "maximum": 100},
                        "offset": {"type": "integer", "minimum": 0}
                    }
                },
                "output_schema": {
                    "type": "object",
                    "properties": {
                        "success": {"type": "boolean"},
                        "tasks": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "title": {"type": "string"},
                                    "description": {"type": "string"},
                                    "due_date": {"type": "string", "format": "date"},
                                    "status": {"type": "string"}
                                }
                            }
                        },
                        "total_count": {"type": "integer"}
                    }
                },
                "endpoint_mapping": "/api/tasks"
            }
        ]
        
        # Add tools to the database
        for tool_data in tools_data:
            tool = ToolDefinition(
                name=tool_data["name"],
                description=tool_data["description"],
                input_schema=tool_data["input_schema"],
                output_schema=tool_data["output_schema"],
                endpoint_mapping=tool_data["endpoint_mapping"]
            )
            db.add(tool)
        
        db.commit()
        print("Tool definitions initialized successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing tool definitions: {str(e)}")
    finally:
        db.close()


if __name__ == "__main__":
    initialize_tool_definitions()