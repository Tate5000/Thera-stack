import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
import os

# For development - in-memory storage
_conversations_db = {}
_messages_db = {}
_user_conversations = {}  # user_id -> list of conversation_ids

def init_db():
    """Initialize in-memory database with some sample data if empty"""
    if not _conversations_db:
        # Sample users
        admin_user = {"id": "admin1", "name": "Admin User", "role": "admin"}
        doctor_user = {"id": "doctor1", "name": "Dr. Sarah Johnson", "role": "doctor"}
        patient_user = {"id": "patient1", "name": "Alex Garcia", "role": "patient"}
        
        # Create a conversation between doctor and patient
        doctor_patient_conv = {
            "id": str(uuid.uuid4()),
            "participants": [doctor_user, patient_user],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "last_message": "When is our next appointment?",
            "title": None,
            "is_group": False
        }
        
        # Create a conversation between admin, doctor and patient (group)
        group_conv = {
            "id": str(uuid.uuid4()),
            "participants": [admin_user, doctor_user, patient_user],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "last_message": "Treatment plan documentation attached",
            "title": "Treatment Planning",
            "is_group": True
        }
        
        # Store conversations
        _conversations_db[doctor_patient_conv["id"]] = doctor_patient_conv
        _conversations_db[group_conv["id"]] = group_conv
        
        # Link users to conversations
        _user_conversations[doctor_user["id"]] = [doctor_patient_conv["id"], group_conv["id"]]
        _user_conversations[patient_user["id"]] = [doctor_patient_conv["id"], group_conv["id"]]
        _user_conversations[admin_user["id"]] = [group_conv["id"]]
        
        # Sample messages for doctor-patient conversation
        message1 = {
            "id": str(uuid.uuid4()),
            "conversation_id": doctor_patient_conv["id"],
            "sender_id": patient_user["id"],
            "sender_name": patient_user["name"],
            "sender_role": patient_user["role"],
            "content": "When is our next appointment?",
            "attachments": [],
            "created_at": datetime.now().isoformat(),
            "read_at": None,
            "is_deleted": False
        }
        
        message2 = {
            "id": str(uuid.uuid4()),
            "conversation_id": doctor_patient_conv["id"],
            "sender_id": doctor_user["id"],
            "sender_name": doctor_user["name"],
            "sender_role": doctor_user["role"],
            "content": "We have one scheduled for next Thursday at 2pm. See you then!",
            "attachments": [],
            "created_at": datetime.now().isoformat(),
            "read_at": None,
            "is_deleted": False
        }
        
        # Store messages
        _messages_db[message1["id"]] = message1
        _messages_db[message2["id"]] = message2

# Initialize the database
init_db()

# CONVERSATION OPERATIONS

def get_conversation(conversation_id: str) -> Optional[Dict[str, Any]]:
    """Get conversation by ID"""
    return _conversations_db.get(conversation_id)

def get_conversations_for_user(user_id: str) -> List[Dict[str, Any]]:
    """Get all conversations for a user"""
    conversation_ids = _user_conversations.get(user_id, [])
    return [_conversations_db[conv_id] for conv_id in conversation_ids if conv_id in _conversations_db]

def create_conversation(participants: List[Dict[str, Any]], title: Optional[str] = None, is_group: bool = False) -> Dict[str, Any]:
    """Create a new conversation"""
    conversation_id = str(uuid.uuid4())
    conversation = {
        "id": conversation_id,
        "participants": participants,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "last_message": None,
        "title": title,
        "is_group": is_group
    }
    
    # Store the conversation
    _conversations_db[conversation_id] = conversation
    
    # Link participants to this conversation
    for participant in participants:
        user_id = participant["id"]
        if user_id not in _user_conversations:
            _user_conversations[user_id] = []
        _user_conversations[user_id].append(conversation_id)
    
    return conversation

def update_conversation_last_message(conversation_id: str, last_message: str) -> Optional[Dict[str, Any]]:
    """Update the last message of a conversation"""
    conversation = _conversations_db.get(conversation_id)
    if not conversation:
        return None
    
    conversation["last_message"] = last_message
    conversation["updated_at"] = datetime.now().isoformat()
    _conversations_db[conversation_id] = conversation
    
    return conversation

# MESSAGE OPERATIONS

def get_messages_for_conversation(conversation_id: str) -> List[Dict[str, Any]]:
    """Get all messages for a conversation"""
    messages = [msg for msg in _messages_db.values() 
                if msg["conversation_id"] == conversation_id and not msg["is_deleted"]]
    # Sort by created_at
    messages.sort(key=lambda x: x["created_at"])
    return messages

def create_message(conversation_id: str, sender_id: str, sender_name: str, 
                  sender_role: str, content: str, 
                  attachments: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """Create a new message in a conversation"""
    if attachments is None:
        attachments = []
        
    message_id = str(uuid.uuid4())
    message = {
        "id": message_id,
        "conversation_id": conversation_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "sender_role": sender_role,
        "content": content,
        "attachments": attachments,
        "created_at": datetime.now().isoformat(),
        "read_at": None,
        "is_deleted": False
    }
    
    # Store the message
    _messages_db[message_id] = message
    
    # Update conversation last message
    update_conversation_last_message(conversation_id, content)
    
    return message

def mark_message_as_read(message_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Mark a message as read by a user"""
    message = _messages_db.get(message_id)
    if not message or message["sender_id"] == user_id:  # Don't mark own messages as read
        return None
    
    message["read_at"] = datetime.now().isoformat()
    _messages_db[message_id] = message
    
    return message

def delete_message(message_id: str) -> bool:
    """Soft delete a message"""
    if message_id not in _messages_db:
        return False
    
    _messages_db[message_id]["is_deleted"] = True
    return True

def get_unread_message_count(conversation_id: str, user_id: str) -> int:
    """Count unread messages in a conversation for a user"""
    messages = get_messages_for_conversation(conversation_id)
    return sum(1 for msg in messages 
              if msg["sender_id"] != user_id and not msg["read_at"] and not msg["is_deleted"])

# Utility functions for the messaging system

def get_conversation_with_user(user_id: str, other_user_id: str) -> Optional[Dict[str, Any]]:
    """Find a direct (non-group) conversation between two users"""
    user_conversations = get_conversations_for_user(user_id)
    for conv in user_conversations:
        if not conv["is_group"] and len(conv["participants"]) == 2:
            participant_ids = [p["id"] for p in conv["participants"]]
            if user_id in participant_ids and other_user_id in participant_ids:
                return conv
    return None