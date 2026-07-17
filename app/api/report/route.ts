export async function GET() {
  return Response.json({
    student: { id: "stu-001", name: "张小满", className: "五（2）班" },
    period: "2026-06-19/2026-07-18",
    mastery: 82.6,
    radar: {
      calculation: 92,
      reasoning: 82,
      modeling: 71,
      expression: 88,
      reading: 76,
      transfer: 68,
    },
    weakPoints: [
      { knowledgePoint: "分数通分", mastery: 40, evidenceCount: 17, priority: 1 },
      { knowledgePoint: "方程移项", mastery: 57, evidenceCount: 13, priority: 2 },
      { knowledgePoint: "单位换算", mastery: 73, evidenceCount: 9, priority: 3 },
    ],
  });
}
