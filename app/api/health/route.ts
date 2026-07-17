export async function GET() {
  return Response.json({
    status: "ok",
    service: "aigrade-demo",
    modules: ["upload", "ocr", "grading", "feedback", "analytics"],
  });
}
