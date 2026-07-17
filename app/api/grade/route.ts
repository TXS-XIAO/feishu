type GradeRequest = {
  subject?: "math" | "essay";
  fileName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as GradeRequest;
  const subject = body.subject === "essay" ? "essay" : "math";

  if (subject === "essay") {
    return Response.json({
      subject,
      score: 84,
      maxScore: 100,
      confidence: 0.92,
      dimensions: { content: 23, structure: 20, language: 21, handwriting: 20 },
      feedback:
        "选材真实，能用上台前后的心理变化表现成长，结尾也有自己的思考。第三段与结尾衔接稍快，建议补充演讲中的一个具体片段，并用一句过渡写清心情从紧张到坚定的变化。",
      weakPoints: ["段落衔接", "细节描写"],
      traceId: crypto.randomUUID(),
    });
  }

  return Response.json({
    subject,
    score: 88,
    maxScore: 100,
    confidence: 0.96,
    questions: [
      { id: 1, score: 10, maxScore: 10, status: "correct", knowledgePoint: "异分母分数加法" },
      { id: 2, score: 6, maxScore: 10, status: "partial", knowledgePoint: "分数混合运算" },
      { id: 3, score: 15, maxScore: 15, status: "correct", knowledgePoint: "简易方程" },
    ],
    feedback:
      "计算步骤写得很清楚，通分和解方程都掌握得不错。第 2 题先算了减法，运算顺序出现偏差，但后续计算正确，已保留过程分。下次先圈出乘除部分，再从左到右计算，你会更稳。",
    weakPoints: ["分数通分", "运算顺序"],
    traceId: crypto.randomUUID(),
  });
}
