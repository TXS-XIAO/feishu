import type { Metadata } from "next";
import AigradeDemo from "./AigradeDemo";

export const metadata: Metadata = {
  title: "智批 AI｜让每份作业都被认真对待",
  description: "面向中小学教师的多学科智能作业批改与学情分析平台。",
};

export default function Home() {
  return <AigradeDemo />;
}
