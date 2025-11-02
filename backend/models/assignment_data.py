from sqlalchemy import UUID, DateTime, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from uuid import UUID as PyUUID
from uuid import uuid4
from datetime import datetime


class AssignmentData(Base):
    __tablename__ = "assignment_data"

    uuid: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, nullable=False, default=uuid4
    )
    creation_date: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now
    )
    progress_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("progress.uuid"), nullable=False
    )
    answer: Mapped[str] = mapped_column(String, nullable=False)
    feedback: Mapped[str] = mapped_column(String, nullable=False)
    success: Mapped[bool] = mapped_column(Boolean, nullable=False)

    progress: Mapped["Progress"] = relationship(back_populates="assignment_data_record")
