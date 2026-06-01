from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import datetime

from src.models.base import BaseModel


class UserRole(str, Enum):
    user = "user"
    moderator = "moderator"
    admin = "admin"


class User(BaseModel):
    """User model"""
    __tablename__ = "users"
    
    firstname = Column(String(50), nullable=False)
    lastname = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    salt = Column(String(255), nullable=True)
    bio = Column(String(500), nullable=True)
    photo_url = Column(String(255), nullable=True)
    cover_url = Column(String(255), nullable=True)
    campus = Column(String(100), nullable=True)
    promo = Column(String(100), nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.user, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    muted_until = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    followers = relationship(
        "Follow",
        foreign_keys="Follow.following_id",
        back_populates="following",
        cascade="all, delete-orphan"
    )
    following = relationship(
        "Follow",
        foreign_keys="Follow.follower_id",
        back_populates="follower",
        cascade="all, delete-orphan"
    )
    messages_sent = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan"
    )
    messages_received = relationship(
        "Message",
        foreign_keys="Message.recipient_id",
        back_populates="recipient",
        cascade="all, delete-orphan"
    )
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="creator", cascade="all, delete-orphan")
    event_rsvps = relationship("EventRSVP", back_populates="user", cascade="all, delete-orphan")
