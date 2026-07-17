from __future__ import annotations

import hashlib
from typing import Any


def recognize_document(content: bytes, subject: str, filename: str) -> dict[str, Any]:
    """可替换 OCR 适配层。

    比赛 Demo 默认返回稳定的结构化样例；生产环境在此注入 PaddleOCR、
    腾讯云或百度 OCR，并保留相同的输出契约。
    """
    fingerprint = hashlib.sha256(content).hexdigest()[:12]
    if subject == "essay":
        blocks = [
            {
                "type": "text",
                "text": "那天放学，我抱着演讲稿走上讲台。虽然很紧张，但我终于鼓起勇气完成了演讲。",
                "confidence": 0.92,
                "bbox": [84, 132, 912, 286],
            }
        ]
    else:
        blocks = [
            {"type": "formula", "latex": r"\frac{3}{4}+\frac{1}{6}=\frac{11}{12}", "confidence": 0.96, "bbox": [120, 168, 628, 252]},
            {"type": "formula", "latex": r"2x+7=19,\quad x=6", "confidence": 0.94, "bbox": [118, 310, 574, 398]},
        ]
    return {
        "document_id": f"doc_{fingerprint}",
        "filename": filename,
        "subject": subject,
        "page_count": 1,
        "orientation": 0,
        "quality": {"blur": 0.08, "shadow": 0.12, "perspective": 0.04},
        "blocks": blocks,
        "requires_review": any(block["confidence"] < 0.82 for block in blocks),
    }
