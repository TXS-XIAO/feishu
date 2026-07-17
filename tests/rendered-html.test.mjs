import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/AigradeDemo.tsx", import.meta.url), "utf8");
const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
const homeSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const gradeRoute = await readFile(new URL("../app/api/grade/route.ts", import.meta.url), "utf8");

test("defines the 智批 AI product shell", () => {
  assert.match(layoutSource, /lang="zh-CN"/);
  assert.match(layoutSource, /智批 AI｜智能作业批改系统/);
  assert.match(homeSource, /AigradeDemo/);
  assert.match(pageSource, /40 份作业/);
  assert.match(pageSource, /今日高频薄弱点/);
  assert.doesNotMatch(layoutSource + homeSource, /codex-preview/);
  assert.doesNotMatch(layoutSource + homeSource, /Your site is taking shape/);
});

test("includes all required interactive competition flows", () => {
  for (const phrase of [
    "数学作业",
    "语文作文",
    "AI 个性化评语",
    "OCR 综合置信度",
    "个人学情雷达",
    "薄弱知识点排行",
  ]) {
    assert.match(pageSource, new RegExp(phrase));
  }
});

test("grade API supports math and essay results", () => {
  assert.match(gradeRoute, /subject === "essay"/);
  assert.match(gradeRoute, /questions:/);
  assert.match(gradeRoute, /dimensions:/);
  assert.match(gradeRoute, /weakPoints:/);
});
