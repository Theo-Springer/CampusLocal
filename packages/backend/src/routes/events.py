from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.db import get_db
from src.schemas.event import EventCreate, EventResponse, EventRSVPResponse, EventRSVPStatus
from src.services.auth_service import get_current_user
from src.models import Event, EventRSVP
import uuid

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("", response_model=EventResponse)
async def create_event(
    event_create: EventCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    event = Event(
        id=str(uuid.uuid4()),
        creator_id=current_user.id,
        title=event_create.title,
        description=event_create.description,
        image_url=event_create.image_url,
        event_date=event_create.event_date,
        location=event_create.location,
        category=event_create.category,
        is_public=event_create.is_public,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return EventResponse.from_orm(event)


@router.get("", response_model=list[EventResponse])
async def get_events(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get all public events"""
    events = db.query(Event).filter(Event.is_public == True, Event.deleted_at.is_(None)).order_by(Event.event_date.desc()).limit(limit).offset(offset).all()
    return [EventResponse.from_orm(e) for e in events]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, db: Session = Depends(get_db)):
    """Get event by ID"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse.from_orm(event)


@router.post("/{event_id}/rsvp")
async def rsvp_event(
    event_id: str,
    status: EventRSVPStatus,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """RSVP to an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    rsvp = db.query(EventRSVP).filter(
        EventRSVP.event_id == event_id,
        EventRSVP.user_id == current_user.id
    ).first()
    
    if rsvp:
        rsvp.status = status
    else:
        rsvp = EventRSVP(
            id=str(uuid.uuid4()),
            event_id=event_id,
            user_id=current_user.id,
            status=status
        )
        db.add(rsvp)
    
    db.commit()
    db.refresh(rsvp)
    return EventRSVPResponse.from_orm(rsvp)
