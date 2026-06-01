from sqlalchemy import Column, String, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship

from src.models.base import BaseModel


class Like(BaseModel):
    """Like model for posts and comments"""
    __tablename__ = "likes"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    comment_id = Column(String(36), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'post_id', name='uq_user_post_like'),
        UniqueConstraint('user_id', 'comment_id', name='uq_user_comment_like'),
        CheckConstraint(
            '(post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)',
            name='ck_one_like_target'
        ),
    )
    
    # Relationships
    user = relationship("User", back_populates="likes")
    post = relationship("Post", back_populates="likes")
    comment = relationship("Comment", back_populates="likes")
