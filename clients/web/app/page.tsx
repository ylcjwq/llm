"use client";
import { useState } from "react";
import type { RequirementResult } from "@repo/contracts";

export default function Home() {
  const [input, setInput] = useState("用户注册时必须绑定手机号，密码至少8位");
  const [result, setResult] = useState<{
    result?: RequirementResult;
    error?: Error | string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function extractRequirement() {
    setLoading(true);
    try {
      const res = await fetch("/api/requirement/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>需求结构化抽取</h1>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 8, fontSize: 14 }}
      />
      <button onClick={extractRequirement} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? "处理中..." : "提交"}
      </button>
      {result && (
        <pre style={{ marginTop: 16, background: "#f5f5f5", padding: 16, borderRadius: 4 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
