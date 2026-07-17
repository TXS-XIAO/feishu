from app.models import EssayGradeRequest, MathGradeRequest, MathStep, StandardMathStep
from app.services.grading import grade_essay, grade_math


def test_math_partial_credit() -> None:
    request = MathGradeRequest(
        student_id="stu-001",
        question_id="q-001",
        student_steps=[
            MathStep(index=1, expression="3/4+1/6=11/12"),
            MathStep(index=2, expression="5/8-2/4=1/8"),
        ],
        standard_steps=[
            StandardMathStep(index=1, expression="3/4+1/6=11/12", score=10, knowledge_point="分数通分"),
            StandardMathStep(index=2, expression="5/8-1/4*2=1/8", score=10, knowledge_point="运算顺序"),
        ],
        max_score=20,
    )
    result = grade_math(request)
    assert result.steps[0].status == "correct"
    assert result.steps[1].status in {"partial", "incorrect"}
    assert result.score < result.max_score


def test_essay_dimensions_sum_to_total() -> None:
    result = grade_essay(
        EssayGradeRequest(
            student_id="stu-002",
            title="记一次成长",
            text="那天我站上讲台，手心全是汗。\n后来看到同学的眼神，我终于鼓起勇气。\n那一刻我明白，成长就是害怕时仍愿意向前。",
            ocr_confidence=0.94,
        )
    )
    assert result.score == sum(item.score for item in result.dimensions.values())
    assert len(result.feedback) > 20
