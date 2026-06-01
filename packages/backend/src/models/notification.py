from sqlalchemy import Column, String, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum

from src.models.base import BaseModel


class NotificationType(str, Enum):
    like = "like"
    comment = "comment"
    follow = "follow"
    message = "message"
    rsvp = "rsvp"


class Notification(BaseModel):
    """Notification model"""
    __tablename__ = "notifications"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    related_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="notifications")
    related_user = relationship("User", foreign_keys=[related_user_id])
    post = relationship("Post")
