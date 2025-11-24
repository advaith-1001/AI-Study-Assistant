import uuid
from typing import List
from uuid import UUID

from google.generativeai import retriever
from langchain_classic.chains import llm
from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, UploadFile, File
from core.auth import fastapi_users
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from core.db import get_session
from models.enums import Status
from models.pathway import EmbeddingStatus
from schemas.pathway_create import PathwayCreate, PathwayResponse
from services.pathway_service import save_pathway_to_db
from services.llm_service import generate_structured_pathway
from schemas.pathway_status import PathwayStatusResponse
from models import User, Pathway, Topic
from services.rag_service import process_and_embed_pdfs
from schemas.topic_create import TopicResponse
from services.quiz_service import generate_quiz
from schemas.quiz_request import QuizRequest
router = APIRouter(prefix="/pathways", tags=["Pathways"])

@router.post("/", response_model=PathwayResponse)
async def create_pathway(
    data: PathwayCreate,
    user_id: UUID = UUID("123e4567-e89b-12d3-a456-426614174000"),  # replace with Depends(get_current_user)
    db: AsyncSession = Depends(get_session),
):
    pathway = await save_pathway_to_db(data, user_id, db)
    return pathway

# 2️⃣ LLM-Generated Pathway
@router.post("/generate", response_model=PathwayResponse)
async def generate_and_save_pathway(
    user_topics: list[str],
    pathway_name: str,
    user_id: UUID = UUID("123e4567-e89b-12d3-a456-426614174000"),  # replace with Depends(get_current_user)
    db: AsyncSession = Depends(get_session),
):
    try:
        llm_data = await generate_structured_pathway(user_topics, pathway_name)
        pathway_schema = PathwayCreate(**llm_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"LLM Error or invalid response: {e}")

    pathway = await save_pathway_to_db(pathway_schema, user_id, db)
    return pathway


@router.get(
    "/{pathway_id}/status",
    response_model=PathwayStatusResponse,
    summary="Get Pathway Completion Status"
)
async def get_pathway_status(
        pathway_id: uuid.UUID,
        db: AsyncSession = Depends(get_session),
        user_id: UUID = UUID("123e4567-e89b-12d3-a456-426614174000"),  # <-- Use correct auth
):
    """
    Retrieves completion statistics for a user's specific learning pathway.
    ...
    """
    # 1. Query the database
    query = (
        select(Pathway)
        .where(Pathway.id == pathway_id, Pathway.user_id == user_id)  # <-- Use user.id
        .options(selectinload(Pathway.topics))
    )
    result = await db.execute(query)
    pathway = result.scalar_one_or_none()

    if not pathway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pathway not found or you do not have permission to view it."
        )

    # 2. Perform the calculations
    all_topics = pathway.topics
    total_topics = len(all_topics)

    # --- THIS IS THE FIX ---
    # First, get the list of completed topic *objects*
    completed_topic_objects = [
        topic for topic in all_topics if topic.status == Status.COMPLETED
    ]

    # Now, convert that list into a list of TopicResponse *schemas*
    completed_topic_responses = [
        TopicResponse.from_orm(topic) for topic in completed_topic_objects
    ]
    # --- END OF FIX ---

    completed_topics_count = len(completed_topic_objects)
    pending_topics_count = total_topics - completed_topics_count

    completion_percentage = 0.0
    if total_topics > 0:
        completion_percentage = (completed_topics_count / total_topics) * 100

    # 3. Return the structured response
    return PathwayStatusResponse(
        total_topics=total_topics,
        completed_topics_count=completed_topics_count,
        pending_topics_count=pending_topics_count,
        completion_percentage=round(completion_percentage, 2),
        completed_topics=completed_topic_responses  # <-- Pass the converted list
    )


@router.post(
    "/{pathway_id}/upload-pdfs",
    status_code=status.HTTP_202_ACCEPTED
)
async def upload_pdfs_for_pathway(
        pathway_id: uuid.UUID,
        background_tasks: BackgroundTasks,
        files: List[UploadFile] = File(...),
        db: AsyncSession = Depends(get_session),
        user_id: UUID = UUID("123e4567-e89b-12d3-a456-426614174000"),
):
    """
    Uploads up to 4 PDFs for a specific pathway.
    This triggers a background task to process and embed the files.
    """
    # 1. Check file limit
    if len(files) > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload a maximum of 4 PDFs at a time."
        )

    # 2. Get pathway and verify ownership (like in your get_status endpoint)
    query = select(Pathway).where(Pathway.id == pathway_id, Pathway.user_id == user_id)
    result = await db.execute(query)
    pathway = result.scalar_one_or_none()

    if not pathway:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pathway not found or you do not have permission."
        )

    # 3. Set status to PROCESSING
    pathway.embedding_status = EmbeddingStatus.PROCESSING
    db.add(pathway)
    await db.commit()

    # 4. Read file contents and schedule the background task
    # We must read the files now, as the UploadFile object
    # will be closed after this request ends.
    file_contents = []
    for file in files:
        contents = await file.read()
        file_contents.append((file.filename, contents))

    background_tasks.add_task(
        process_and_embed_pdfs, pathway_id, file_contents
    )

    return {
        "message": "Files accepted. Processing has started in the background.",
        "pathway_id": pathway_id,
        "embedding_status": EmbeddingStatus.PROCESSING
    }

@router.post("/generate-quiz")
async def quiz_generate(data: QuizRequest, db: AsyncSession = Depends(get_session)):
    query = (
        select(Topic)
        .options(selectinload(Topic.pathway))
        .where(Topic.id == data.topic_id)
    )
    result = await db.execute(query)
    topic = result.scalar_one_or_none()

    quiz = await generate_quiz(topic, data.difficulty, data.num_questions, retriever)
    return quiz




