from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from src.models import User, Post, Comment, Like, Follow, Event, EventRSVP, UserRole, PostType, EventCategory, EventRSVPStatus
from src.services.auth_service import hash_password


def seed_database(db: Session):
    """Seed database with demo data"""
    # Check if already seeded
    if db.query(User).count() > 0:
        return
    
    # Create demo users
    users_data = [
        {
            "firstname": "Léa",
            "lastname": "Martin",
            "email": "lea@campus.local",
            "password": "password123",
            "bio": "Passionnée par les révisions et le marketing 📚",
            "campus": "Campus Homneo",
            "promo": "BTS NDRC 1A"
        },
        {
            "firstname": "Thomas",
            "lastname": "Khelil",
            "email": "thomas@campus.local",
            "password": "password123",
            "bio": "Gaming & sorties 🎮",
            "campus": "Campus Homneo",
            "promo": "Licence Pro Marketing"
        },
        {
            "firstname": "Sara",
            "lastname": "Benali",
            "email": "sara@campus.local",
            "password": "password123",
            "bio": "Café & révisions ☕",
            "campus": "Campus Homneo",
            "promo": "BTS NDRC 1A"
        },
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            id=str(uuid.uuid4()),
            firstname=user_data["firstname"],
            lastname=user_data["lastname"],
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            bio=user_data["bio"],
            campus=user_data["campus"],
            promo=user_data["promo"],
            role=UserRole.user
        )
        db.add(user)
        users.append(user)
    
    db.commit()
    
    # Create demo posts
    posts = []
    for i, user in enumerate(users):
        post = Post(
            id=str(uuid.uuid4()),
            user_id=user.id,
            content=f"Mon premier post sur CampusLocal! 🚀 - {user.firstname}",
            post_type=PostType.text,
            likes_count=5,
            comments_count=2
        )
        db.add(post)
        posts.append(post)
    
    db.commit()
    
    # Create follows
    if len(users) > 1:
        follow = Follow(
            id=str(uuid.uuid4()),
            follower_id=users[0].id,
            following_id=users[1].id
        )
        db.add(follow)
        db.commit()
    
    # Create demo event
    if users:
        event = Event(
            id=str(uuid.uuid4()),
            creator_id=users[0].id,
            title="Soirée intégration BTS NDRC",
            description="Venez profiter d'une soirée entre étudiants!",
            event_date=datetime.utcnow() + timedelta(days=7),
            location="Campus Homneo, Paris",
            category=EventCategory.party,
            is_public=True
        )
        db.add(event)
        db.commit()
