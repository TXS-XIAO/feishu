from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .models import EssayGradeRequest, MathGradeRequest
from .services.grading import grade_essay, grade_math
from .services.ocr import recognize_document
from .services.reports import build_student_report

app = FastAPI(
    title="智批 AI API",
    version="1.0.0",
    description="多学科 OCR、分步评分、个性化评语与学情分析服务",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health() -> dict:
    return {
        "status": "ok",
        "modules": ["ocr", "math_grading", "essay_grading", "feedback", "analytics"],
    }


@app.post("/api/v1/ocr/recognize")
async def ocr_recognize(file: UploadFile = File(...), subject: str = "math") -> dict:
    if file.content_type not in {"image/jpeg", "image/png", "application/pdf"}:
        raise HTTPException(status_code=415, detail="仅支持 JPG、PNG 或 PDF")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="文件不能超过 20MB")
    return recognize_document(content, subject=subject, filename=file.filename or "upload")


@app.post("/api/v1/grade/math")
def math_grade(request: MathGradeRequest) -> dict:
    return grade_math(request).model_dump()


@app.post("/api/v1/grade/essay")
def essay_grade(request: EssayGradeRequest) -> dict:
    return grade_essay(request).model_dump()


@app.get("/api/v1/reports/students/{student_id}")
def student_report(student_id: str, days: int = 30) -> dict:
    if days not in {7, 30, 90}:
        raise HTTPException(status_code=400, detail="days 仅支持 7、30、90")
    return build_student_report(student_id, days)
