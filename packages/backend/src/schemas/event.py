from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


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


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None
    category: EventCategory = EventCategory.other
    is_public: bool = True


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    category: Optional[EventCategory] = None
    is_public: Optional[bool] = None


class EventResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    event_date: datetime
    location: Optional[str]
    category: EventCategory
    is_public: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class EventRSVPResponse(BaseModel):
    id: str
    event_id: str
    user_id: str
    status: EventRSVPStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
