from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.db import get_db
from src.schemas.user import UserResponse, UserUpdate
from src.schemas.post import PostResponse
from src.services.auth_service import get_current_user
from src.services.user_service import UserService
from src.models import Post

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.from_orm(user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user"""
    user = UserService.update_user(db, current_user, user_update)
    return UserResponse.from_orm(user)


@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Follow a user"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    if not UserService.get_user_by_id(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    
    UserService.follow_user(db, current_user.id, user_id)
    return {"status": "followed"}


@router.post("/{user_id}/unfollow")
async def unfollow_user(
    user_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unfollow a user"""
    UserService.unfollow_user(db, current_user.id, user_id)
    return {"status": "unfollowed"}


@router.get("/{user_id}/posts", response_model=list[PostResponse])
async def get_user_posts(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get user's posts"""
    user = UserService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    posts = UserService.get_user_posts(db, user_id, limit, offset)
    return [PostResponse.from_orm(post) for post in posts]
