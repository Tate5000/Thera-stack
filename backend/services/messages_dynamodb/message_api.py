from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
import uuid
import json
import sys
import os

# Fix import path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from models.message import (
    Message, Conversation, Attachment,
    MessageResponse, ConversationResponse, 
    ConversationWithMessagesResponse, ConversationListResponse
)

from . import message_db

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
    responses={404: {"description": "Not found"}},
)

# Mockup auth - in real app, this would validate JWT tokens
async def get_current_user():
    # Mocked user for development
    return {
        "id": "patient1",
        "name": "Alex Garcia",
        "role": "patient"
    }

@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(current_user = Depends(get_current_user)):
    """Get all conversations for the current user"""
    user_id = current_user["id"]
    
    # Get conversations
    conversations = message_db.get_conversations_for_user(user_id)
    
    # Format response with latest message and unread count
    conversation_responses = []
    for conv in conversations:
        # Get messages for this conversation
        messages = message_db.get_messages_for_conversation(conv["id"])
        
        # Get latest message
        latest_message = None
        if messages:
            latest_message = messages[-1]  # Last message in the chronologically sorted list
        
        # Get unread count
        unread_count = message_db.get_unread_message_count(conv["id"], user_id)
        
        # Add to response
        conversation_responses.append({
            "conversation": conv,
            "latest_message": latest_message,
            "unread_count": unread_count
        })
    
    # Sort by most recent activity
    conversation_responses.sort(
        key=lambda x: x["conversation"]["updated_at"], 
        reverse=True
    )
    
    return {"conversations": conversation_responses}

@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessagesResponse)
async def get_conversation(conversation_id: str, current_user = Depends(get_current_user)):
    """Get a conversation with all its messages"""
    user_id = current_user["id"]
    
    # Get conversation
    conversation = message_db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    participant_ids = [p["id"] for p in conversation["participants"]]
    if user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
    
    # Get messages
    messages = message_db.get_messages_for_conversation(conversation_id)
    
    # Mark all messages as read
    for message in messages:
        if message["sender_id"] != user_id and not message["read_at"]:
            message_db.mark_message_as_read(message["id"], user_id)
    
    return {
        "conversation": conversation,
        "messages": messages
    }

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    title: Optional[str] = None,
    is_group: bool = False,
    participant_ids: List[str] = [],
    current_user = Depends(get_current_user)
):
    """Create a new conversation"""
    user_id = current_user["id"]
    user_name = current_user["name"]
    user_role = current_user["role"]
    
    # Check participants
    if not participant_ids:
        raise HTTPException(status_code=400, detail="Must include at least one participant")
    
    # TODO: In a real app, validate that the participant_ids exist and the current user has permission to message them
    
    # Add current user if not already in participants
    if user_id not in participant_ids:
        participant_ids.append(user_id)
    
    # For demo purposes, create mock participants
    participants = []
    for pid in participant_ids:
        if pid == "admin1":
            participants.append({"id": "admin1", "name": "Admin User", "role": "admin"})
        elif pid == "doctor1":
            participants.append({"id": "doctor1", "name": "Dr. Sarah Johnson", "role": "doctor"})
        elif pid == "patient1":
            participants.append({"id": "patient1", "name": "Alex Garcia", "role": "patient"})
        else:
            participants.append({"id": pid, "name": f"User {pid}", "role": "unknown"})
    
    # If direct message (2 participants), check if conversation already exists
    if len(participants) == 2 and not is_group:
        other_id = participant_ids[0] if participant_ids[0] != user_id else participant_ids[1]
        existing_conv = message_db.get_conversation_with_user(user_id, other_id)
        if existing_conv:
            messages = message_db.get_messages_for_conversation(existing_conv["id"])
            latest_message = messages[-1] if messages else None
            unread_count = message_db.get_unread_message_count(existing_conv["id"], user_id)
            
            return {
                "conversation": existing_conv,
                "latest_message": latest_message,
                "unread_count": unread_count
            }
    
    # Create new conversation
    conversation = message_db.create_conversation(participants, title, is_group)
    
    return {
        "conversation": conversation,
        "latest_message": None,
        "unread_count": 0
    }

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def create_message(
    conversation_id: str,
    content: str,
    current_user = Depends(get_current_user)
):
    """Create a new message in a conversation"""
    user_id = current_user["id"]
    user_name = current_user["name"]
    user_role = current_user["role"]
    
    # Get conversation
    conversation = message_db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    participant_ids = [p["id"] for p in conversation["participants"]]
    if user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="Not authorized to message in this conversation")
    
    # Create message
    message = message_db.create_message(
        conversation_id=conversation_id,
        sender_id=user_id,
        sender_name=user_name,
        sender_role=user_role,
        content=content
    )
    
    return {"message": message}

@router.post("/conversations/{conversation_id}/upload", response_model=MessageResponse)
async def upload_attachment(
    conversation_id: str,
    content: str = Form(...),
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """Upload a file as an attachment to a conversation"""
    user_id = current_user["id"]
    user_name = current_user["name"]
    user_role = current_user["role"]
    
    # Get conversation
    conversation = message_db.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Check if user is a participant
    participant_ids = [p["id"] for p in conversation["participants"]]
    if user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="Not authorized to message in this conversation")
    
    # In a real app, we would upload the file to S3 or similar
    # Here we'll mock this process
    file_contents = await file.read()
    file_size = len(file_contents)
    
    attachment = {
        "id": str(uuid.uuid4()),
        "name": file.filename,
        "size": file_size,
        "type": file.content_type,
        "url": f"/api/files/{conversation_id}/{file.filename}",  # Mock URL
        "uploaded_at": datetime.now().isoformat()
    }
    
    # Create message with attachment
    message = message_db.create_message(
        conversation_id=conversation_id,
        sender_id=user_id,
        sender_name=user_name,
        sender_role=user_role,
        content=content,
        attachments=[attachment]
    )
    
    return {"message": message}

@router.delete("/messages/{message_id}")
async def delete_message(message_id: str, current_user = Depends(get_current_user)):
    """Delete a message"""
    user_id = current_user["id"]
    
    # Find the message
    message = message_db._messages_db.get(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check if user is the sender
    if message["sender_id"] != user_id:
        raise HTTPException(status_code=403, detail="Can only delete your own messages")
    
    # Delete message
    success = message_db.delete_message(message_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete message")
    
    return {"success": True}