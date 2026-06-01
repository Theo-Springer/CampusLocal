from sqlalchemy import Column, String, Text, Integer, ForeignKey, Enum as SQLEnum, ARRAY
from sqlalchemy.orm import relationship
from enum import Enum
from typing import List

from src.models.base import BaseModel


class PostType(str, Enum):
    text = "text"
    image = "image"
    video = "video"
    event = "event"


class Post(BaseModel):
    """Post model"""
    __tablename__ = "posts"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    post_type = Column(SQLEnum(PostType), default=PostType.text, nullable=False)
    media_urls = Column(ARRAY(String), nullable=True)
    likes_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    
    # Relationships
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
