from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class MathStep(BaseModel):
    index: int
    expression: str
    answer: str | None = None


class StandardMathStep(BaseModel):
    index: int
    expression: str
    score: float = Field(gt=0)
    knowledge_point: str
    equivalent_answers: list[str] = []


class MathGradeRequest(BaseModel):
    student_id: str
    question_id: str
    student_steps: list[MathStep]
    standard_steps: list[StandardMathStep]
    max_score: float = Field(gt=0)


class StepGrade(BaseModel):
    index: int
    status: Literal["correct", "partial", "incorrect"]
    score: float
    max_score: float
    evidence: str
    knowledge_point: str


class MathGradeResult(BaseModel):
    subject: Literal["math"] = "math"
    score: float
    max_score: float
    steps: list[StepGrade]
    weak_points: list[str]
    feedback: str
    requires_review: bool


class EssayRubric(BaseModel):
    content: int = 25
    structure: int = 25
    language: int = 25
    handwriting: int = 25


class EssayGradeRequest(BaseModel):
    student_id: str
    title: str
    text: str = Field(min_length=20)
    ocr_confidence: float = Field(ge=0, le=1)
    rubric: EssayRubric = EssayRubric()


class EssayDimension(BaseModel):
    score: float
    max_score: float
    evidence: list[str]
    suggestion: str


class EssayGradeResult(BaseModel):
    subject: Literal["essay"] = "essay"
    score: float
    max_score: float
    dimensions: dict[str, EssayDimension]
    weak_points: list[str]
    feedback: str
    requires_review: bool
