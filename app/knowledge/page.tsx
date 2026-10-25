"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { BookOpen, FileText, Link2, MessageCircle, Search, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { ProfileMenu } from "@/components/profile-menu";
import { PillNav } from "@/components/reactbits";

type DocumentItem = {
  id: string;
  title: string;
  sourceType: string;
  citations: number;
  chars: number;
};

type Citation = {
  title: string;
  quote: string;
  source: string;
  chunkIndex: number;
  score: number;
};

type Retrieval = { totalChunks: number; hits: number; method: string };

const MODE_LABEL: Record<string, string> = {
  "live-rag": "模型基于检索片段作答",
  "local-retrieval": "本地词法检索（未配置模型）",
  "no-hit": "未命中片段",
  empty: "知识库为空",
};

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("输入一个问题，系统会切块检索并返回带片段定位的引用。");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [retrieval, setRetrieval] = useState<Retrieval | null>(null);
  const [mode, setMode] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    const response = await fetch("/api/knowledge");
    if (!response.ok) return;
    const data = await response.json();
    setDocuments(data.documents ?? []);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function ask() {
    if (!query.trim()) return;
    setLoading(true);
    const response = await fetch("/api/knowledge/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json().catch(() => ({}));
    setAnswer(data.answer ?? "请求失败，请稍后重试。");
    setCitations(data.citations ?? []);
    setRetrieval(data.retrieval ?? null);
    setMode(data.mode ?? "");
    setLoading(false);
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/knowledge/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `已加入知识库：${data.document.title}（${data.document.citations} 个片段）` : data.error);
    if (response.ok) loadDocuments();
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="container">
          <header className="topbar">
            <Brand subtitle="资料知识库" />
            <PillNav
              items={[
                { label: "工作台", href: "/dashboard" },
                { label: "知识库", href: "/knowledge", active: true },
                { label: "作品评审", href: "/review" },
              ]}
            />
            <ProfileMenu />
          </header>
        </div>
      </div>

      <main className="container dashboard-main">
        <div className="dash-header">
          <div>
            <div className="eyebrow">
              <i /> Retrieval · 片段级引用
            </div>
            <h1>让每个判断都有来源。</h1>
            <p>资料按段落切块，用 TF-IDF + 余弦相似度检索，回答附命中片段与相似度分数。</p>
          </div>
          <label className="button primary">
            <Sparkles size={15} /> 导入资料
            <input type="file" hidden accept=".txt,.md,text/plain,text/markdown" onChange={upload} />
          </label>
        </div>

        {message && (
          <div className="demo-note" style={{ marginBottom: 14 }}>
            <BookOpen size={15} />
            {message}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>资料问答</h2>
                <p>
                  {retrieval
                    ? `索引 ${retrieval.totalChunks} 个片段，本次命中 ${retrieval.hits} 个（${retrieval.method}）`
                    : "当前索引会参与回答与引用"}
                </p>
              </div>
              <Search size={17} color="#8390a3" />
            </div>
            <div className="input-wrap" style={{ marginTop: 8 }}>
              <MessageCircle size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：AI 技术深度具体考察哪些能力？"
                onKeyDown={(event) => {
                  if (event.key === "Enter") ask();
                }}
              />
            </div>
            <button className="button primary" style={{ marginTop: 14 }} onClick={ask} disabled={loading}>
              询问 QuestPilot <Sparkles size={15} />
            </button>
            <div className="demo-note" style={{ marginTop: 18 }}>
              <BookOpen size={15} />
              <span>
                {answer}
                {mode && (
                  <>
                    <br />
                    <small style={{ opacity: 0.75 }}>回答模式：{MODE_LABEL[mode] ?? mode}</small>
                  </>
                )}
              </span>
            </div>
            {citations.length > 0 && (
              <div className="action-list" style={{ marginTop: 14 }}>
                {citations.map((item, i) => (
                  <div className="action-row" key={`${item.title}-${item.chunkIndex}-${i}`}>
                    <span className="action-icon">{i + 1}</span>
                    <div>
                      <strong>
                        {item.title} · 片段 {item.chunkIndex}
                      </strong>
                      <p>{item.quote}…</p>
                      <small style={{ color: "#8190a2" }}>相似度 {item.score.toFixed(4)} · 来源 {item.source}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>已索引资料</h2>
                <p>共 {documents.length} 份 · 团队共享空间</p>
              </div>
              <FileText size={17} color="#8390a3" />
            </div>
            {documents.length === 0 && <p className="demo-note">还没有资料。导入一份 TXT / Markdown 后即可检索。</p>}
            {documents.map((doc, i) => (
              <div className="knowledge-row" key={doc.id} style={{ marginTop: i === 0 ? 0 : 9 }}>
                <div className="knowledge-icon">
                  {doc.sourceType === "url" ? <Link2 size={17} /> : <FileText size={17} />}
                </div>
                <div>
                  <strong>{doc.title}</strong>
                  <small>
                    {doc.sourceType} · {doc.citations} 个可引用片段 · {doc.chars} 字符
                  </small>
                </div>
                <span className="dash-chip">已索引</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
