# 智批 AI——AI 智能作业批改系统

面向中小学教师的比赛级 AI 作业批改系统，覆盖多学科 OCR、数学分步评分、作文四维评价、个性化评语和知识点薄弱分析。

## 已实现功能

- 教师工作台、作业上传、批改结果和学情报告页面；
- 数学计算题、方程按步骤评分，支持部分正确给过程分；
- 语文作文内容、结构、语言、书写四维评分；
- OCR 置信度、低置信结果提示和教师复核；
- 个性化评语编辑、学生雷达图、薄弱点排行和学习路径；
- FastAPI 后端、MySQL 表结构、Redis/Docker 部署方案；
- 可替换 PaddleOCR、腾讯云 OCR、百度 OCR 和大模型适配层。

## 快速运行

安装 Node.js 22 或更高版本，在项目根目录执行：

```powershell
npm.cmd install
npm.cmd run dev
```

打开终端显示的本地地址，通常为 `http://localhost:3000`。前端比赛 Demo 已包含稳定演示接口，无需 OCR 或大模型密钥即可体验完整流程。

运行独立 FastAPI：

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

接口文档：`http://localhost:8000/docs`

## 项目结构

```text
app/          前端页面与站内演示 API
backend/      FastAPI、评分服务与测试
database/     MySQL 数据库脚本
db/           数据访问层结构
worker/       Cloudflare Worker 入口
docs/         技术文档、答辩指南与运行说明
tests/        前端产品流程测试
```

## 文档

- [完整技术说明](docs/AI智能作业批改系统-技术说明文档.md)
- [比赛演示与答辩指南](docs/比赛演示与答辩指南.md)
- [本地运行说明](docs/本地运行说明.md)

