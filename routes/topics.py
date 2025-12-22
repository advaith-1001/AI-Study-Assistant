from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from core.db import get_session
from core.auth import fastapi_users
from models import User, Topic, Pathway
from models.pathway import EmbeddingStatus
from services.rag_service import generate_summary_for_topic
from uuid import UUID
from models.enums import Status
from datetime import datetime, timezone
import uuid
from schemas.topic_create import TopicResponse
router = APIRouter(prefix="/topics", tags=["Topics"])


class SummaryResponse(BaseModel):
    topic_id: int
    summary: str


@router.get(
    "/{topic_id}/summary",
    response_model=SummaryResponse
)
async def get_topic_summary(
        topic_id: int,
        db: AsyncSession = Depends(get_session),
        user: User = Depends(fastapi_users.current_user()),
):
    # 1. Get the topic and its parent pathway
    query = (
        select(Topic)
        .options(selectinload(Topic.pathway))
        .where(Topic.id == topic_id)
    )
    result = await db.execute(query)
    topic = result.scalar_one_or_none()

    # 2. Validate topic and ownership
    if not topic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Topic not found.")

    if topic.pathway.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    # --- OPTIMIZATION START ---
    # 3. Check if we already have a generated summary in the DB
    if topic.summary:
        # Return the existing summary instantly
        return SummaryResponse(topic_id=topic_id, summary=topic.summary)
    # --- OPTIMIZATION END ---

    # 4. Check if embeddings are ready (only needed if we actually have to generate)
    if topic.pathway.embedding_status != EmbeddingStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Embeddings are not ready. Current status: {topic.pathway.embedding_status.value}"
        )

    # 5. Generate the summary
    summary = await generate_summary_for_topic(topic)

    # --- SAVE TO DB START ---
    # 6. Store the newly generated summary so next time is instant
    topic.summary = summary
    await db.commit()
    # --- SAVE TO DB END ---

    return SummaryResponse(topic_id=topic_id, summary=summary)

# Endpoint to mark a topic as complete

@router.post("/{topic_id}/complete")
async def mark_topic_complete(topic_id: int, db: AsyncSession = Depends(get_session),
                              user: User = Depends(fastapi_users.current_user())):
    query = (
        select(Topic)
        .options(selectinload(Topic.pathway))
        .where(Topic.id == topic_id)
    )
    result = await db.execute(query)
    topic = result.scalar_one_or_none()

    # 2. Validate topic and ownership
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found."
        )

    if topic.pathway.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this topic."
        )

    # 3. Check if it's already complete (idempotency)
    if topic.status == Status.COMPLETED:
        return topic  # Already done, just return the success response

    # 4. Update the topic's status and timestamp
    topic.status = Status.COMPLETED
    topic.completed = datetime.now()  # Use UTC timezone

    db.add(topic)
    await db.commit()
    await db.refresh(topic)

    return topic


@router.get(
    "/{pathway_id}/current-topic",
    response_model=Optional[TopicResponse],  # Can be a Topic or 'null'
    summary="Get the Next Pending Topic"
)
async def get_current_topic(
        pathway_id: uuid.UUID,  # Match the type from your /status route
        db: AsyncSession = Depends(get_session),
        user: User = Depends(fastapi_users.current_user()),
):
    """
    Retrieves the next topic in the pathway that is marked as 'PENDING',
    based on the 'order_number'.

    - Verifies the user owns the pathway.
    - Returns 'null' if all topics are completed.
    """

    # 1. Query for the pathway and all its topics (same as your /status route)
    # This single query is efficient and handles authorization.
    query = (
        select(Pathway)
        .where(Pathway.id == pathway_id, Pathway.user_id == user.id)
        .options(selectinload(Pathway.topics))
    )
    result = await db.execute(query)
    pathway = result.scalar_one_or_none()

    # 2. Handle not found / not authorized
    if not pathway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pathway not found or you do not have permission."
        )

    # 3. Find the current topic in the (already loaded) list of topics

    # Filter for pending topics
    pending_topics = [
        topic for topic in pathway.topics
        if topic.status == Status.PENDING
    ]

    # 4. Handle pathway completion
    if not pending_topics:
        # All topics are complete
        return None

        # 5. Sort the pending topics by order_number to find the first one
    # This is a fast, in-memory Python sort on the small list of topics
    pending_topics.sort(key=lambda t: t.order_number)

    current_topic = pending_topics[0]

    return current_topic