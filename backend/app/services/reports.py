from __future__ import annotations


def build_student_report(student_id: str, days: int) -> dict:
    return {
        "student": {"id": student_id, "name": "张小满", "class_name": "五（2）班"},
        "period_days": days,
        "mastery": 82.6,
        "radar": {
            "calculation": 92,
            "reasoning": 82,
            "modeling": 71,
            "expression": 88,
            "reading": 76,
            "transfer": 68,
        },
        "weak_points": [
            {"name": "分数通分", "mastery": 40, "wrong_count": 17, "trend": "improving"},
            {"name": "方程移项", "mastery": 57, "wrong_count": 13, "trend": "stable"},
            {"name": "单位换算", "mastery": 73, "wrong_count": 9, "trend": "improving"},
        ],
        "learning_path": [
            {"order": 1, "name": "同分母分数加减", "status": "mastered"},
            {"order": 2, "name": "异分母分数通分", "status": "current", "minutes": 18},
            {"order": 3, "name": "分数混合运算", "status": "locked"},
            {"order": 4, "name": "分数应用题", "status": "locked"},
        ],
    }
