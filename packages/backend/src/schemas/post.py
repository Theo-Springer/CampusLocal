from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PostType(str, Enum):
    text = "text"
    image = "image"
    video = "video"
    event = "event"


class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    post_type: PostType = PostType.text
    media_urls: Optional[List[str]] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None


class PostResponse(BaseModel):
    id: str
    user_id: str
    content: str
    post_type: PostType
    media_urls: Optional[List[str]]
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    id: str
    post_id: str
    user_id: str
    content: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class LikeResponse(BaseModel):
    id: str
    user_id: str
    post_id: Optional[str]
    comment_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
