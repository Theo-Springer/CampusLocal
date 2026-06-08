from sqlalchemy import Column, String, Text, DateTime, Boolean, Enum as SQLEnum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from enum import Enum
from datetime import datetime

from src.models.base import BaseModel


class EventCategory(str, Enum):
    party = "party"
    study = "study"
    sports = "sports"
    casual = "casual"
    other = "other"


class EventRSVPStatus(str, Enum):
    yes = "yes"
    maybe = "maybe"
    no = "no"


class Event(BaseModel):
    """Event model"""
    __tablename__ = "events"
    
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False)
    location = Column(String(255), nullable=True)
    category = Column(SQLEnum(EventCategory), default=EventCategory.other, nullable=False)
    is_public = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    creator = relationship("User", back_populates="events")
    rsvps = relationship("EventRSVP", back_populates="event", cascade="all, delete-orphan")


class EventRSVP(BaseModel):
    """Event RSVP model"""
    __tablename__ = "event_rsvps"
    
    event_id = Column(String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(EventRSVPStatus), default=EventRSVPStatus.no, nullable=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='uq_event_user_rsvp'),
    )
    
    # Relationships
    event = relationship("Event", back_populates="rsvps")
    user = relationship("User", back_populates="event_rsvps")
