from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload  # 👈 Import this
from sqlalchemy import select  # 👈 And this
from models import Pathway, Topic
from schemas.pathway_create import PathwayCreate
from datetime import datetime


async def save_pathway_to_db(data: PathwayCreate, user_id: int, db: AsyncSession):
    """
    Saves pathway and topics to DB with eager loading for a safe return.
    """
    # Create the pathway instance
    new_pathway = Pathway(
        name=data.name,
        user_id=user_id,
        created=datetime.utcnow(),
        updated=datetime.utcnow()
    )
    db.add(new_pathway)
    await db.flush()  # This assigns an ID to new_pathway.id

    # Create and add topic instances
    for topic_data in data.topics:
        topic = Topic(
            name=topic_data.name,
            order_number=topic_data.order_number,
            status=topic_data.status,
            keywords=topic_data.keywords,
            pathway_id=new_pathway.id,
        )

        db.add(topic)

    await db.commit()

    # ✅ BEST PRACTICE: Re-fetch the object with its relationships eagerly loaded
    # This is the key to solving the error.
    query = (
        select(Pathway)
        .where(Pathway.id == new_pathway.id)
        .options(selectinload(Pathway.topics))  # Tell SQLAlchemy to load the topics
    )
    result = await db.execute(query)
    saved_pathway_with_topics = result.scalar_one()

    return saved_pathway_with_topics