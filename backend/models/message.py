from typing import List, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class Attachment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    size: int
    type: str  # MIME type
    url: str
    uploaded_at: datetime = Field(default_factory=datetime.now)

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    attachments: Optional[List[Attachment]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    read_at: Optional[datetime] = None
    is_deleted: bool = False
    
class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participants: List[dict]  # List of {id, name, role}
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_message: Optional[str] = None
    title: Optional[str] = None  # For group conversations
    is_group: bool = False
    
class MessageResponse(BaseModel):
    """Response model for sending a message"""
    message: Message
    
class ConversationResponse(BaseModel):
    """Response model for conversations with latest message"""
    conversation: Conversation
    latest_message: Optional[Message] = None
    unread_count: int = 0

class ConversationWithMessagesResponse(BaseModel):
    """Response model for a conversation with all its messages"""
    conversation: Conversation
    messages: List[Message]
    
class ConversationListResponse(BaseModel):
    """Response model for listing all conversations"""
    conversations: List[ConversationResponse]