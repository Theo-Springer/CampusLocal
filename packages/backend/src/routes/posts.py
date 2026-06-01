from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.database.db import get_db
from src.schemas.post import PostCreate, PostResponse, CommentCreate, CommentResponse, LikeResponse
from src.services.auth_service import get_current_user
from src.services.user_service import PostService, LikeService
from src.models import Post, Comment, Like

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("", response_model=PostResponse)
async def create_post(
    post_create: PostCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new post"""
    post = PostService.create_post(
        db,
        current_user.id,
        post_create.content,
        post_create.post_type,
        post_create.media_urls
    )
    return PostResponse.from_orm(post)


@router.get("", response_model=list[PostResponse])
async def get_posts(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get posts feed"""
    posts = PostService.get_posts_feed(db, limit, offset)
    return [PostResponse.from_orm(post) for post in posts]


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, db: Session = Depends(get_db)):
    """Get post by ID"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostResponse.from_orm(post)


@router.post("/{post_id}/like")
async def like_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    LikeService.like_post(db, current_user.id, post_id)
    return {"status": "liked"}


@router.post("/{post_id}/unlike")
async def unlike_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unlike a post"""
    LikeService.unlike_post(db, current_user.id, post_id)
    return {"status": "unliked"}


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: str,
    comment_create: CommentCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a comment on a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    import uuid
    comment = Comment(
        id=str(uuid.uuid4()),
        post_id=post_id,
        user_id=current_user.id,
        content=comment_create.content
    )
    post.comments_count += 1
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentResponse.from_orm(comment)


@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def get_comments(
    post_id: str,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get comments for a post"""
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).limit(limit).offset(offset).all()
    return [CommentResponse.from_orm(c) for c in comments]
