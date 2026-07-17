"use client";

import { useMemo, useRef, useState } from "react";

type View = "dashboard" | "upload" | "result" | "analytics" | "students" | "settings";
type Subject = "math" | "essay";
type GradeResult = {
  subject: Subject;
  score: number;
  maxScore: number;
  confidence: number;
  feedback: string;
};

const navItems: Array<{ id: View; label: string; icon: string }> = [
  { id: "dashboard", label: "工作台", icon: "⌂" },
  { id: "upload", label: "作业批改", icon: "✦" },
  { id: "analytics", label: "学情分析", icon: "⌁" },
  { id: "students", label: "学生档案", icon: "◎" },
  { id: "settings", label: "作业管理", icon: "▣" },
];

const assignments = [
  { title: "五年级数学 · 分数混合运算", className: "五（2）班", progress: 40, total: 40, avg: 86.5, status: "已完成", tone: "green" },
  { title: "六年级语文 · 记一次成长", className: "六（1）班", progress: 36, total: 42, avg: 82.0, status: "批改中", tone: "amber" },
  { title: "五年级数学 · 简易方程", className: "五（1）班", progress: 38, total: 38, avg: 89.2, status: "已完成", tone: "green" },
];

const weakPoints = [
  { label: "分数通分", value: 78, count: 17, color: "#ed6b57" },
  { label: "方程移项", value: 61, count: 13, color: "#f3a63b" },
  { label: "单位换算", value: 45, count: 9, color: "#7357d8" },
  { label: "审题建模", value: 36, count: 7, color: "#48a686" },
];

export default function AigradeDemo() {
  const [view, setView] = useState<View>("dashboard");
  const [subject, setSubject] = useState<Subject>("math");
  const [fileName, setFileName] = useState("");
  const [grading, setGrading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const activeTitle = useMemo(() => navItems.find((n) => n.id === view)?.label ?? "工作台", [view]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function chooseSample(next: Subject) {
    setSubject(next);
    setFileName(next === "math" ? "张小满_分数混合运算_第3页.jpg" : "林嘉禾_记一次成长_作文.jpg");
    setResult(null);
  }

  async function startGrading() {
    if (!fileName) {
      showToast("请先上传作业，或使用演示样例");
      return;
    }
    setGrading(true);
    setProgress(8);
    const timer = window.setInterval(() => setProgress((p) => Math.min(92, p + Math.ceil(Math.random() * 13))), 260);
    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, fileName }),
      });
      const data = (await response.json()) as GradeResult;
      window.clearInterval(timer);
      setProgress(100);
      window.setTimeout(() => {
        setResult(data);
        setGrading(false);
        setView("result");
      }, 380);
    } catch {
      window.clearInterval(timer);
      const fallback: GradeResult = {
        subject,
        score: subject === "math" ? 88 : 84,
        maxScore: 100,
        confidence: 0.94,
        feedback: subject === "math"
          ? "计算步骤清晰，方程思路正确；第 3 题通分时遗漏最小公倍数，请先圈出分母再统一计算。"
          : "选材真实，成长转折具体；第三段衔接稍显突然，建议补一句心情变化，让结构更自然。",
      };
      setResult(fallback);
      setGrading(false);
      setView("result");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("dashboard")} aria-label="返回工作台">
          <span className="brand-mark">智</span>
          <span><strong>智批 AI</strong><small>AI 作业批改助手</small></span>
        </button>
        <nav aria-label="主导航">
          <p className="nav-caption">教学工作</p>
          {navItems.slice(0, 4).map((item) => (
            <button key={item.id} className={`nav-item ${view === item.id || (item.id === "upload" && view === "result") ? "active" : ""}`} onClick={() => setView(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {item.id === "upload" && <b>6</b>}
            </button>
          ))}
          <p className="nav-caption secondary">管理</p>
          <button className={`nav-item ${view === "settings" ? "active" : ""}`} onClick={() => setView("settings")}>
            <span className="nav-icon">▣</span>作业管理
          </button>
        </nav>
        <div className="sidebar-insight">
          <span className="insight-spark">✦</span>
          <strong>本周为你节省</strong>
          <em>11.6 小时</em>
          <small>已智能批改 286 份作业</small>
        </div>
        <div className="teacher-card">
          <span className="avatar">周</span>
          <span><strong>周老师</strong><small>实验小学 · 数学组</small></span>
          <i>•••</i>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeTitle}</p>
            <h1>{view === "dashboard" ? "早上好，周老师" : activeTitle}</h1>
          </div>
          <div className="top-actions">
            <span className="date-chip">2026 / 07 / 18</span>
            <button className="icon-button" aria-label="消息">♢<span /></button>
            <button className="primary-button compact" onClick={() => setView("upload")}>＋ 新建批改</button>
          </div>
        </header>

        {view === "dashboard" && <Dashboard onUpload={() => setView("upload")} onAnalytics={() => setView("analytics")} />}
        {view === "upload" && (
          <UploadPanel
            subject={subject}
            fileName={fileName}
            grading={grading}
            progress={progress}
            fileRef={fileRef}
            onSubject={setSubject}
            onSample={chooseSample}
            onPick={() => fileRef.current?.click()}
            onFile={(name) => setFileName(name)}
            onGrade={startGrading}
          />
        )}
        {view === "result" && <ResultPanel result={result} onBack={() => setView("upload")} onSave={() => showToast("批改结果已保存到学生档案")} />}
        {view === "analytics" && <Analytics />}
        {view === "students" && <Students onOpen={() => setView("analytics")} />}
        {view === "settings" && <AssignmentManager onCreate={() => setView("upload")} />}
      </main>

      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}

function Dashboard({ onUpload, onAnalytics }: { onUpload: () => void; onAnalytics: () => void }) {
  return (
    <div className="page-content dashboard-page">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="hero-kicker">AI 教学副驾已就绪</span>
          <h2>40 份作业，<br /><em>一杯咖啡的时间。</em></h2>
          <p>从识别笔迹、分步判分到个性化评语，智批 AI 帮你完成重复工作，把时间还给真正的教学。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onUpload}>开始智能批改 <span>→</span></button>
            <button className="text-button" onClick={onAnalytics}>查看班级学情</button>
          </div>
        </div>
        <div className="hero-visual" aria-label="实时批改数据">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="paper-card paper-back"><span>作文</span></div>
          <div className="paper-card paper-front">
            <div className="paper-top"><span>数学练习</span><b>92</b></div>
            <div className="paper-line short" />
            <div className="formula">3/4 + 1/6 = <u>11/12</u> <i>✓</i></div>
            <div className="paper-line" />
            <div className="paper-line medium" />
            <div className="teacher-note">步骤完整，继续保持！</div>
          </div>
          <div className="floating-pill pill-a"><span>99.2%</span> OCR 置信度</div>
          <div className="floating-pill pill-b"><span>3.8s</span> 单份耗时</div>
        </div>
      </section>

      <section className="stats-row" aria-label="今日概览">
        <article><span className="stat-icon violet">✓</span><div><small>今日已批改</small><strong>76 <i>份</i></strong><em>↑ 18% 较昨日</em></div></article>
        <article><span className="stat-icon mint">◷</span><div><small>平均用时</small><strong>3.8 <i>秒/份</i></strong><em>比人工快 47 倍</em></div></article>
        <article><span className="stat-icon coral">◈</span><div><small>平均得分</small><strong>86.5 <i>分</i></strong><em>↑ 2.3 本周</em></div></article>
        <article><span className="stat-icon amber">◎</span><div><small>待教师复核</small><strong>6 <i>份</i></strong><em className="warning">低置信度优先</em></div></article>
      </section>

      <div className="dashboard-grid">
        <section className="panel assignment-panel">
          <div className="panel-title"><div><span>最近作业</span><h3>批改进度</h3></div><button>查看全部 →</button></div>
          <div className="assignment-list">
            {assignments.map((item) => (
              <article key={item.title}>
                <div className={`subject-badge ${item.tone}`}>{item.title.includes("语文") ? "文" : "数"}</div>
                <div className="assignment-main">
                  <strong>{item.title}</strong><small>{item.className} · 今天 08:30</small>
                  <div className="progress-track"><span style={{ width: `${(item.progress / item.total) * 100}%` }} /></div>
                </div>
                <div className="assignment-count"><strong>{item.progress}<i>/{item.total}</i></strong><small>平均 {item.avg}</small></div>
                <span className={`status ${item.tone}`}>{item.status}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel weak-panel">
          <div className="panel-title"><div><span>AI 洞察</span><h3>今日高频薄弱点</h3></div><button onClick={onAnalytics}>详情 →</button></div>
          <div className="weak-list">
            {weakPoints.map((point, index) => (
              <div className="weak-row" key={point.label}>
                <i>{index + 1}</i>
                <span className="weak-name">{point.label}<small>{point.count} 人出错</small></span>
                <div className="mini-track"><span style={{ width: `${point.value}%`, background: point.color }} /></div>
                <b>{point.value}%</b>
              </div>
            ))}
          </div>
          <div className="ai-tip"><span>✦</span><p><strong>建议明日用 8 分钟复习「分数通分」</strong><small>预计可使班级正确率提升 12%—16%</small></p></div>
        </section>
      </div>
    </div>
  );
}

function UploadPanel(props: {
  subject: Subject; fileName: string; grading: boolean; progress: number;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onSubject: (s: Subject) => void; onSample: (s: Subject) => void;
  onPick: () => void; onFile: (name: string) => void; onGrade: () => void;
}) {
  return (
    <div className="page-content upload-page">
      <div className="stepper">
        <span className="done"><b>1</b>上传作业</span><i /><span className={props.grading ? "current" : ""}><b>2</b>AI 识别与批改</span><i /><span><b>3</b>教师复核</span>
      </div>
      <div className="upload-layout">
        <section className="panel upload-main">
          <div className="section-heading"><span>01</span><div><h2>选择批改学科</h2><p>系统会自动匹配对应的 OCR 与评分引擎</p></div></div>
          <div className="subject-switch">
            <button className={props.subject === "math" ? "selected" : ""} onClick={() => props.onSubject("math")}><b>∑</b><span><strong>数学作业</strong><small>计算题 · 方程 · 应用题</small></span><i>推荐</i></button>
            <button className={props.subject === "essay" ? "selected" : ""} onClick={() => props.onSubject("essay")}><b>文</b><span><strong>语文作文</strong><small>内容 · 结构 · 语言 · 书写</small></span></button>
          </div>
          <div className="section-heading second"><span>02</span><div><h2>上传学生作业</h2><p>支持手机拍照、扫描件与批量 PDF，单次最多 50 份</p></div></div>
          <input ref={props.fileRef} type="file" accept="image/*,.pdf" hidden onChange={(e) => props.onFile(e.target.files?.[0]?.name ?? "")} />
          <button className={`drop-zone ${props.fileName ? "has-file" : ""}`} onClick={props.onPick}>
            {props.fileName ? (
              <><span className="file-preview">{props.subject === "math" ? "∑" : "文"}</span><div><strong>{props.fileName}</strong><small>图片已完成方向校正 · 点击可重新选择</small></div><i>✓</i></>
            ) : (
              <><span className="upload-icon">↑</span><strong>拖入文件，或点击选择</strong><small>JPG / PNG / PDF · 单个文件不超过 20MB</small></>
            )}
          </button>
          <div className="sample-row">
            <span>没有作业图片？</span>
            <button onClick={() => props.onSample("math")}>体验数学样例</button>
            <button onClick={() => props.onSample("essay")}>体验作文样例</button>
          </div>
        </section>
        <aside className="panel grading-config">
          <div className="config-title"><span>⚙</span><div><h3>批改设置</h3><p>本次任务配置</p></div></div>
          <label>作业名称<input defaultValue={props.subject === "math" ? "分数混合运算练习" : "记一次成长"} /></label>
          <label>班级<select defaultValue="五（2）班"><option>五（2）班</option><option>六（1）班</option></select></label>
          <label>评分标准<select defaultValue="智能分步评分"><option>智能分步评分</option><option>严格标准答案</option></select></label>
          <div className="toggle-row"><span><strong>生成个性化评语</strong><small>优点 + 错误点 + 建议</small></span><i className="toggle on" /></div>
          <div className="toggle-row"><span><strong>更新学情档案</strong><small>写入知识点掌握度</small></span><i className="toggle on" /></div>
          {props.grading ? (
            <div className="grading-progress">
              <div><span>AI 正在批改</span><strong>{props.progress}%</strong></div>
              <div className="progress-track"><span style={{ width: `${props.progress}%` }} /></div>
              <small>{props.progress < 35 ? "正在进行版面分析与切题…" : props.progress < 70 ? "正在识别手写公式与解题步骤…" : "正在生成个性化评语…"}</small>
            </div>
          ) : (
            <button className="primary-button grade-button" onClick={props.onGrade}>✦ 开始智能批改</button>
          )}
          <p className="privacy-note">作业数据加密处理，不用于模型训练</p>
        </aside>
      </div>
    </div>
  );
}

function ResultPanel({ result, onBack, onSave }: { result: GradeResult | null; onBack: () => void; onSave: () => void }) {
  const isMath = (result?.subject ?? "math") === "math";
  return (
    <div className="page-content result-page">
      <div className="result-toolbar">
        <button className="back-button" onClick={onBack}>← 返回上传</button>
        <div><span className="status green">AI 批改完成</span><strong>{isMath ? "张小满 · 分数混合运算" : "林嘉禾 ·《记一次成长》"}</strong></div>
        <div className="toolbar-actions"><button>导出 PDF</button><button className="primary-button compact" onClick={onSave}>确认并保存</button></div>
      </div>
      <div className="result-grid">
        <section className="paper-review">
          <div className="paper-sheet">
            <div className="sheet-header"><span>{isMath ? "五年级数学练习" : "语文习作"}</span><small>姓名：{isMath ? "张小满" : "林嘉禾"}</small></div>
            {isMath ? <MathPaper /> : <EssayPaper />}
          </div>
          <div className="confidence-strip"><span>OCR 综合置信度 <strong>{Math.round((result?.confidence ?? 0.94) * 100)}%</strong></span><span><i className="confidence-dot high" />高置信 18</span><span><i className="confidence-dot low" />待复核 2</span></div>
        </section>
        <aside className="review-sidebar">
          <div className="score-card">
            <div className="score-ring"><strong>{result?.score ?? (isMath ? 88 : 84)}</strong><small>/ {result?.maxScore ?? 100}</small></div>
            <div><span>本次得分</span><h3>{isMath ? "良好" : "表达真挚"}</h3><p>超过班级 {isMath ? "72%" : "68%"} 的同学</p></div>
          </div>
          {isMath ? <MathBreakdown /> : <EssayBreakdown />}
          <div className="feedback-card">
            <div className="feedback-title"><span>✦</span><strong>AI 个性化评语</strong><button>重新生成</button></div>
            <textarea defaultValue={result?.feedback ?? ""} aria-label="教师评语" />
            <div className="feedback-tags"><span>优点肯定</span><span>错误定位</span><span>改进建议</span></div>
          </div>
          <div className="knowledge-card">
            <div><span>本次薄弱点</span><button>加入学习路径</button></div>
            {(isMath ? ["分数通分", "运算顺序"] : ["段落衔接", "细节描写"]).map((tag, i) => <span className="knowledge-tag" key={tag}>{tag}<b>{i === 0 ? "重点" : "巩固"}</b></span>)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function MathPaper() {
  return (
    <div className="math-work">
      <p><b>一、计算下面各题（每题 10 分）</b></p>
      <div className="question correct"><span>1.</span><div>3/4 + 1/6<br />= 9/12 + 2/12<br />= <u>11/12</u></div><i>✓ +10</i></div>
      <div className="question partial"><span>2.</span><div>5/8 − 1/4 × 2<br />= 5/8 − 2/4<br />= <u>1/8</u></div><i>△ +6</i><em>先乘除，再加减<br />第二步计算正确</em></div>
      <p><b>二、解方程（每题 15 分）</b></p>
      <div className="question correct"><span>3.</span><div>2x + 7 = 19<br />2x = 12 <small>（移项）</small><br />x = <u>6</u></div><i>✓ +15</i></div>
      <div className="red-note">思路清楚！注意第 2 题的运算顺序。</div>
    </div>
  );
}

function EssayPaper() {
  return (
    <div className="essay-work">
      <h3>记一次成长</h3>
      <p>那天放学，天空像被水洗过一样。我抱着刚发下来的演讲稿，心里像揣着一只不停扑腾的小鸟。</p>
      <p className="marked">轮到我上台时，手心全是汗。看到台下同学们鼓励的眼神，我深吸一口气，终于迈出了第一步。</p>
      <p>声音从发颤到坚定，我第一次发现，勇气不是不害怕，而是害怕时仍愿意向前。</p>
      <p>走下讲台，老师向我点点头。那一刻我明白，每一次尝试，都会让自己长大一点。</p>
      <span className="essay-comment">细节真实，结尾有升华 ✓</span>
      <span className="essay-suggest">可补充演讲中一个具体片段，画面会更鲜活。</span>
    </div>
  );
}

function MathBreakdown() {
  return (
    <div className="breakdown-card">
      <h3>分题得分</h3>
      {[["计算题 1", "10 / 10", 100], ["计算题 2", "6 / 10", 60], ["解方程", "30 / 30", 100], ["应用题", "42 / 50", 84]].map(([name, score, pct]) => (
        <div className="break-row" key={String(name)}><span>{name}</span><div className="mini-track"><i style={{ width: `${pct}%` }} /></div><b>{score}</b></div>
      ))}
    </div>
  );
}

function EssayBreakdown() {
  return (
    <div className="breakdown-card essay-breakdown">
      <h3>四维评分</h3>
      {[["内容", 23, 25], ["结构", 20, 25], ["语言", 21, 25], ["书写", 20, 25]].map(([name, score, max]) => (
        <div className="dimension" key={String(name)}><span>{name}</span><div className="mini-track"><i style={{ width: `${(Number(score) / Number(max)) * 100}%` }} /></div><b>{score}<small>/{max}</small></b></div>
      ))}
    </div>
  );
}

function Analytics() {
  return (
    <div className="page-content analytics-page">
      <section className="analysis-hero">
        <div><span className="hero-kicker">五（2）班 · 最近 30 天</span><h2>班级知识掌握度 <em>稳步上升</em></h2><p>基于 1,284 道题与 286 份作业的学习证据生成</p></div>
        <div className="analysis-score"><strong>82.6</strong><span>综合掌握度<em>↑ 4.8%</em></span></div>
      </section>
      <div className="analytics-grid">
        <section className="panel radar-panel">
          <div className="panel-title"><div><span>能力画像</span><h3>个人学情雷达</h3></div><select defaultValue="张小满"><option>张小满</option><option>林嘉禾</option></select></div>
          <div className="radar-wrap">
            <div className="radar-label top">计算准确 <b>92</b></div>
            <div className="radar-label right-top">逻辑推理 <b>82</b></div>
            <div className="radar-label right-bottom">应用建模 <b>71</b></div>
            <div className="radar-label bottom">规范表达 <b>88</b></div>
            <div className="radar-label left-bottom">审题能力 <b>76</b></div>
            <div className="radar-label left-top">知识迁移 <b>68</b></div>
            <div className="radar-grid grid-one" /><div className="radar-grid grid-two" /><div className="radar-grid grid-three" />
            <div className="radar-data" />
          </div>
          <div className="radar-legend"><span><i />本月</span><span><i />班级均值</span></div>
        </section>
        <section className="panel ranking-panel">
          <div className="panel-title"><div><span>优先干预</span><h3>薄弱知识点排行</h3></div><button>导出报告</button></div>
          {weakPoints.map((point, i) => (
            <div className="rank-item" key={point.label}>
              <span className={`rank-number rank-${i}`}>{i + 1}</span>
              <div><strong>{point.label}</strong><small>{i === 0 ? "前置：最小公倍数" : i === 1 ? "关联：等式性质" : "近 3 次作业"}</small></div>
              <div className="mastery"><span>掌握度</span><strong>{100 - point.value + 18}%</strong></div>
              <em>{point.count} 人需巩固</em>
            </div>
          ))}
        </section>
      </div>
      <section className="panel learning-path">
        <div className="panel-title"><div><span>AI 推荐</span><h3>张小满的个性化学习路径</h3></div><button>发送给学生</button></div>
        <div className="path-line">
          <article className="complete"><span>✓</span><div><small>已掌握</small><strong>同分母分数加减</strong><p>正确率 96%</p></div></article>
          <i />
          <article className="current"><span>2</span><div><small>当前重点 · 预计 18 分钟</small><strong>异分母分数通分</strong><p>微课 6 分钟 + 典型题 4 道</p></div></article>
          <i />
          <article><span>3</span><div><small>下一步</small><strong>分数混合运算</strong><p>前置掌握后自动解锁</p></div></article>
          <i />
          <article><span>4</span><div><small>能力迁移</small><strong>分数应用题</strong><p>真实情境建模练习</p></div></article>
        </div>
      </section>
    </div>
  );
}

function Students({ onOpen }: { onOpen: () => void }) {
  const students = [["张小满", "五（2）班", "88.6", "分数通分", "上升"], ["林嘉禾", "五（2）班", "91.2", "单位换算", "稳定"], ["陈一诺", "五（2）班", "84.5", "方程移项", "上升"], ["李可心", "五（2）班", "79.8", "审题建模", "关注"]];
  return (
    <div className="page-content simple-page">
      <section className="panel table-panel">
        <div className="panel-title"><div><span>40 名学生</span><h3>学生学习档案</h3></div><div className="search-box">⌕ <input placeholder="搜索学生" /></div></div>
        <div className="student-table">
          <div className="table-head"><span>学生</span><span>班级</span><span>近 30 天均分</span><span>主要薄弱点</span><span>趋势</span><span /></div>
          {students.map((s) => <div className="table-row" key={s[0]}><span><i>{s[0].slice(0, 1)}</i><b>{s[0]}</b></span><span>{s[1]}</span><strong>{s[2]}</strong><span className="knowledge-tag">{s[3]}</span><em className={s[4] === "关注" ? "danger" : ""}>{s[4]}</em><button onClick={onOpen}>查看报告 →</button></div>)}
        </div>
      </section>
    </div>
  );
}

function AssignmentManager({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="page-content simple-page">
      <section className="panel manager-panel">
        <div className="panel-title"><div><span>标准答案与评分规则</span><h3>作业管理</h3></div><button className="primary-button compact" onClick={onCreate}>＋ 新建作业</button></div>
        <div className="manager-cards">
          {assignments.map((a, i) => <article key={a.title}><span className="subject-badge green">{i === 1 ? "文" : "数"}</span><div><strong>{a.title}</strong><small>{a.className} · 共 {a.total} 份</small></div><span className={`status ${a.tone}`}>{a.status}</span><button>设置评分规则</button></article>)}
        </div>
      </section>
    </div>
  );
}
