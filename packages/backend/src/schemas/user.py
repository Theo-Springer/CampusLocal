from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    user = "user"
    moderator = "moderator"
    admin = "admin"


# Request schemas
class UserCreate(BaseModel):
    firstname: str = Field(..., min_length=1, max_length=50)
    lastname: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    bio: Optional[str] = None
    campus: Optional[str] = None
    promo: Optional[str] = None


class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    bio: Optional[str] = None
    campus: Optional[str] = None
    promo: Optional[str] = None
    photo_url: Optional[str] = None
    cover_url: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Response schemas
class UserResponse(BaseModel):
    id: str
    firstname: str
    lastname: str
    email: str
    bio: Optional[str]
    photo_url: Optional[str]
    cover_url: Optional[str]
    campus: Optional[str]
    promo: Optional[str]
    role: UserRole
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    muted_until: Optional[datetime]
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class FollowResponse(BaseModel):
    id: str
    follower_id: str
    following_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
