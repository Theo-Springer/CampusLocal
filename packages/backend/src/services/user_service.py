from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.models import User, Post, Comment, Like
from src.schemas.user import UserCreate, UserUpdate
from src.services.auth_service import hash_password
import uuid


class UserService:
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create a new user"""
        try:
            db_user = User(
                id=str(uuid.uuid4()),
                firstname=user_create.firstname,
                lastname=user_create.lastname,
                email=user_create.email,
                password_hash=hash_password(user_create.password),
                bio=user_create.bio,
                campus=user_create.campus,
                promo=user_create.promo,
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            raise ValueError("User with this email already exists")
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def update_user(db: Session, user: User, user_update: UserUpdate) -> User:
        """Update user"""
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def follow_user(db: Session, follower_id: str, following_id: str) -> bool:
        """Follow a user"""
        from src.models import Follow
        
        existing = db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        if existing:
            return False
        
        follow = Follow(
            id=str(uuid.uuid4()),
            follower_id=follower_id,
            following_id=following_id
        )
        db.add(follow)
        db.commit()
        return True
    
    @staticmethod
    def unfollow_user(db: Session, follower_id: str, following_id: str) -> bool:
        """Unfollow a user"""
        from src.models import Follow
        
        follow = db.query(Follow).filter(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        ).first()
        
        if not follow:
            return False
        
        db.delete(follow)
        db.commit()
        return True
    
    @staticmethod
    def get_followers(db: Session, user_id: str) -> int:
        """Get follower count"""
        from src.models import Follow
        
        return db.query(Follow).filter(Follow.following_id == user_id).count()
    
    @staticmethod
    def get_following(db: Session, user_id: str) -> int:
        """Get following count"""
        from src.models import Follow
        
        return db.query(Follow).filter(Follow.follower_id == user_id).count()


class PostService:
    @staticmethod
    def create_post(db: Session, user_id: str, content: str, post_type: str, media_urls=None) -> Post:
        """Create a new post"""
        db_post = Post(
            id=str(uuid.uuid4()),
            user_id=user_id,
            content=content,
            post_type=post_type,
            media_urls=media_urls or []
        )
        db.add(db_post)
        db.commit()
        db.refresh(db_post)
        return db_post
    
    @staticmethod
    def get_posts_feed(db: Session, limit: int = 20, offset: int = 0):
        """Get posts feed"""
        return db.query(Post).filter(Post.deleted_at.is_(None)).order_by(Post.created_at.desc()).limit(limit).offset(offset).all()
    
    @staticmethod
    def get_user_posts(db: Session, user_id: str, limit: int = 20, offset: int = 0):
        """Get posts by user"""
        return db.query(Post).filter(Post.user_id == user_id, Post.deleted_at.is_(None)).order_by(Post.created_at.desc()).limit(limit).offset(offset).all()


class LikeService:
    @staticmethod
    def like_post(db: Session, user_id: str, post_id: str) -> bool:
        """Like a post"""
        existing = db.query(Like).filter(Like.user_id == user_id, Like.post_id == post_id).first()
        if existing:
            return False
        
        like = Like(
            id=str(uuid.uuid4()),
            user_id=user_id,
            post_id=post_id
        )
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.likes_count += 1
        
        db.add(like)
        db.commit()
        return True
    
    @staticmethod
    def unlike_post(db: Session, user_id: str, post_id: str) -> bool:
        """Unlike a post"""
        like = db.query(Like).filter(Like.user_id == user_id, Like.post_id == post_id).first()
        if not like:
            return False
        
        post = db.query(Post).filter(Post.id == post_id).first()
        if post and post.likes_count > 0:
            post.likes_count -= 1
        
        db.delete(like)
        db.commit()
        return True
