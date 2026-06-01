from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class Comment(BaseModel):
    """Comment model"""
    __tablename__ = "comments"
    
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    likes = relationship("Like", back_populates="comment", cascade="all, delete-orphan")
