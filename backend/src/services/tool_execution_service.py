from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import json
import requests
from ..models.tool_definition import ToolDefinition


class ToolExecutionService:
    """
    Service class to execute tools that are called by the AI.
    This service ensures that the AI doesn't directly access the database
    but instead uses the existing API endpoints through these tools.
    """
    
    def __init__(self, db_session: Session, base_api_url: str = "http://localhost:8000/api"):
        self.db = db_session
        self.base_api_url = base_api_url
    
    def execute_tool(self, tool_name: str, tool_args: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
        """
        Execute a tool with the given arguments.
        
        Args:
            tool_name: Name of the tool to execute
            tool_args: Arguments to pass to the tool
            auth_token: Authentication token for API calls (if needed)
            
        Returns:
            Result of the tool execution
        """
        # Get the tool definition from the database
        tool_def = self.db.query(ToolDefinition).filter(ToolDefinition.name == tool_name).first()
        
        if not tool_def:
            return {
                "success": False,
                "error": f"Tool '{tool_name}' not found",
                "message": f"Tool '{tool_name}' is not available"
            }
        
        # Execute the appropriate tool based on its name
        if tool_name == "create_task":
            return self._execute_create_task(tool_args, auth_token)
        elif tool_name == "update_task":
            return self._execute_update_task(tool_args, auth_token)
        elif tool_name == "delete_task":
            return self._execute_delete_task(tool_args, auth_token)
        elif tool_name == "list_tasks":
            return self._execute_list_tasks(tool_args, auth_token)
        else:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}",
                "message": f"Tool '{tool_name}' is not implemented"
            }
    
    def _execute_create_task(self, args: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
        """
        Execute the create_task tool by calling the existing task creation endpoint.
        """
        try:
            headers = {
                "Content-Type": "application/json"
            }
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
            # Prepare the payload for the API call
            payload = {
                "title": args.get("title"),
                "description": args.get("description", ""),
                "due_date": args.get("due_date"),
                "status": args.get("status", "pending")
            }
            
            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}
            
            # Make the API call to create the task
            response = requests.post(
                f"{self.base_api_url}/tasks",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "success": True,
                    "task_id": result.get("id"),
                    "message": "Task created successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to create task: {response.text}",
                    "message": "Failed to create task"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "An error occurred while creating the task"
            }
    
    def _execute_update_task(self, args: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
        """
        Execute the update_task tool by calling the existing task update endpoint.
        """
        try:
            task_id = args.get("task_id")
            if not task_id:
                return {
                    "success": False,
                    "error": "task_id is required for update_task",
                    "message": "Missing required parameter: task_id"
                }
            
            headers = {
                "Content-Type": "application/json"
            }
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
            # Prepare the payload for the API call
            payload = {}
            if "title" in args:
                payload["title"] = args["title"]
            if "description" in args:
                payload["description"] = args["description"]
            if "due_date" in args:
                payload["due_date"] = args["due_date"]
            if "status" in args:
                payload["status"] = args["status"]
            
            # Make the API call to update the task
            response = requests.put(
                f"{self.base_api_url}/tasks/{task_id}",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Task updated successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to update task: {response.text}",
                    "message": "Failed to update task"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "An error occurred while updating the task"
            }
    
    def _execute_delete_task(self, args: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
        """
        Execute the delete_task tool by calling the existing task deletion endpoint.
        """
        try:
            task_id = args.get("task_id")
            if not task_id:
                return {
                    "success": False,
                    "error": "task_id is required for delete_task",
                    "message": "Missing required parameter: task_id"
                }
            
            headers = {}
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
            # Make the API call to delete the task
            response = requests.delete(
                f"{self.base_api_url}/tasks/{task_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": "Task deleted successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to delete task: {response.text}",
                    "message": "Failed to delete task"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "An error occurred while deleting the task"
            }
    
    def _execute_list_tasks(self, args: Dict[str, Any], auth_token: str = None) -> Dict[str, Any]:
        """
        Execute the list_tasks tool by calling the existing task listing endpoint.
        """
        try:
            headers = {}
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
            # Prepare query parameters
            params = {}
            if "status" in args:
                params["status"] = args["status"]
            if "limit" in args:
                params["limit"] = args["limit"]
            if "offset" in args:
                params["offset"] = args["offset"]
            
            # Make the API call to list tasks
            response = requests.get(
                f"{self.base_api_url}/tasks",
                headers=headers,
                params=params
            )
            
            if response.status_code == 200:
                tasks = response.json()
                return {
                    "success": True,
                    "tasks": tasks,
                    "total_count": len(tasks),
                    "message": "Tasks retrieved successfully"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to list tasks: {response.text}",
                    "message": "Failed to list tasks"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "An error occurred while listing tasks"
            }