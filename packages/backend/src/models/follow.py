from sqlalchemy import Column, String, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class Follow(BaseModel):
    """Follow relationship model"""
    __tablename__ = "follows"
    
    follower_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='uq_follower_following'),
        CheckConstraint('follower_id != following_id', name='ck_no_self_follow'),
    )
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], backref="followers_rel")
    following = relationship("User", foreign_keys=[following_id], backref="following_rel")
