from __future__ import annotations

import re
from difflib import SequenceMatcher

from ..models import (
    EssayDimension,
    EssayGradeRequest,
    EssayGradeResult,
    MathGradeRequest,
    MathGradeResult,
    StepGrade,
)


def _normalize_math(value: str) -> str:
    table = str.maketrans("＋－×÷（）＝，", "+-*/()=,")
    return re.sub(r"\s+", "", value.translate(table)).lower()


def _similarity(left: str, right: str) -> float:
    return SequenceMatcher(None, _normalize_math(left), _normalize_math(right)).ratio()


def grade_math(request: MathGradeRequest) -> MathGradeResult:
    standard = {step.index: step for step in request.standard_steps}
    grades: list[StepGrade] = []
    weak_points: set[str] = set()

    for student_step in request.student_steps:
        expected = standard.get(student_step.index)
        if expected is None:
            continue
        candidates = [expected.expression, *expected.equivalent_answers]
        similarity = max(_similarity(student_step.expression, answer) for answer in candidates)
        if similarity >= 0.92:
            status, score, evidence = "correct", expected.score, "表达式与标准步骤等价"
        elif similarity >= 0.62:
            status, score, evidence = "partial", round(expected.score * 0.6, 1), "方法方向正确，局部计算或书写有误"
            weak_points.add(expected.knowledge_point)
        else:
            status, score, evidence = "incorrect", 0.0, "关键等价变形不成立"
            weak_points.add(expected.knowledge_point)
        grades.append(
            StepGrade(
                index=student_step.index,
                status=status,
                score=score,
                max_score=expected.score,
                evidence=evidence,
                knowledge_point=expected.knowledge_point,
            )
        )

    graded_indexes = {step.index for step in grades}
    for index, expected in standard.items():
        if index not in graded_indexes:
            grades.append(
                StepGrade(
                    index=index,
                    status="incorrect",
                    score=0,
                    max_score=expected.score,
                    evidence="未识别到该步骤",
                    knowledge_point=expected.knowledge_point,
                )
            )
            weak_points.add(expected.knowledge_point)

    score = min(request.max_score, round(sum(item.score for item in grades), 1))
    correct = [item.knowledge_point for item in grades if item.status == "correct"]
    advantage = correct[0] if correct else "主动写出了解题过程"
    weakness = next(iter(weak_points), "计算规范")
    feedback = (
        f"你在「{advantage}」上的步骤写得很清楚。"
        f"这次主要问题出在「{weakness}」，已有正确方向的步骤仍保留了过程分。"
        "建议下次先标出关键条件，每完成一步都做一次等价性检查，你会更稳定。"
    )
    return MathGradeResult(
        score=score,
        max_score=request.max_score,
        steps=sorted(grades, key=lambda item: item.index),
        weak_points=sorted(weak_points),
        feedback=feedback,
        requires_review=any(item.status == "partial" for item in grades),
    )


def grade_essay(request: EssayGradeRequest) -> EssayGradeResult:
    text = request.text.strip()
    paragraphs = [part.strip() for part in re.split(r"\n+", text) if part.strip()]
    length = len(text)
    has_turn = any(word in text for word in ("但是", "后来", "终于", "没想到", "那一刻"))
    has_detail = any(word in text for word in ("手心", "眼神", "声音", "心里", "脚步", "阳光"))
    has_reflection = any(word in text for word in ("明白", "懂得", "成长", "原来", "我发现"))
    punctuation_ratio = len(re.findall(r"[，。！？；：“”]", text)) / max(length, 1)

    content = min(request.rubric.content, 16 + min(length / 80, 4) + (2 if has_detail else 0) + (2 if has_reflection else 0))
    structure = min(request.rubric.structure, 16 + min(len(paragraphs), 4) + (3 if has_turn else 0))
    language = min(request.rubric.language, 16 + min(punctuation_ratio * 80, 4) + (3 if has_detail else 0))
    handwriting = min(request.rubric.handwriting, 14 + request.ocr_confidence * 10)

    dimensions = {
        "content": EssayDimension(
            score=round(content, 1),
            max_score=request.rubric.content,
            evidence=["主题明确", "包含真实经历" if has_detail else "具体细节偏少"],
            suggestion="补充一个可见、可听或可感的关键细节。",
        ),
        "structure": EssayDimension(
            score=round(structure, 1),
            max_score=request.rubric.structure,
            evidence=[f"识别到 {len(paragraphs)} 个自然段", "有转折推进" if has_turn else "段落推进较平"],
            suggestion="在事件转折处加入承上启下的一句。",
        ),
        "language": EssayDimension(
            score=round(language, 1),
            max_score=request.rubric.language,
            evidence=["表达自然", "有心理描写" if has_detail else "句式变化较少"],
            suggestion="把一处概括叙述改成动作或心理描写。",
        ),
        "handwriting": EssayDimension(
            score=round(handwriting, 1),
            max_score=request.rubric.handwriting,
            evidence=[f"OCR 置信度 {request.ocr_confidence:.0%}", "版面整洁"],
            suggestion="保持段首空格与标点占格规范。",
        ),
    }
    total = round(sum(item.score for item in dimensions.values()), 1)
    weak_points = [
        name
        for name, item in dimensions.items()
        if item.score / item.max_score < 0.82
    ]
    feedback = (
        "文章选材真实，能够围绕题目写清一次具体经历，结尾也有自己的思考。"
        + ("转折自然，细节让读者能感受到你的变化。" if has_turn and has_detail else "中间部分的变化过程还可以写得更具体。")
        + "建议选一个最关键的瞬间，补充动作、语言或心理描写，再用一句话衔接到结尾，文章会更有感染力。"
    )
    return EssayGradeResult(
        score=total,
        max_score=float(sum(request.rubric.model_dump().values())),
        dimensions=dimensions,
        weak_points=weak_points,
        feedback=feedback,
        requires_review=request.ocr_confidence < 0.82,
    )
