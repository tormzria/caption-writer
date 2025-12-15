"use client";

import React, { useMemo, useState } from "react";
import BlurredImage from "./components/BlurredImage";

type Mode = "easy" | "medium" | "hard";
type Detail = "low" | "high" | "auto";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [mode, setMode] = useState<Mode>("medium");
  const [detail, setDetail] = useState<Detail>("auto");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const [riddle, setRiddle] = useState("");
  const [solution, setSolution] = useState("");
  const [answer, setAnswer] = useState("");
  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] = useState<Mode>("medium");
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);

  const canRun = useMemo(() => !!preview && !loading, [preview, loading]);

  function onPickFile(f: File | null) {
    setError("");
    setRiddle("");
    setSolution("");
    setAnswer("");
    setFocus("");
    setRevealed(false);

    setFile(f);
    if (!f) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  async function fileToDataUrl(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `data:${f.type || "image/jpeg"};base64,${b64}`;
  }

  async function createRiddle() {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(0);
    setRevealed(false);

    // “fake” progress (jó UX), amíg fut az API
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Date.now() - start;
      const p = Math.min(95, Math.floor((t / 2500) * 100));
      setProgress(p);
    }, 80);

    try {
      const imageDataUrl = await fileToDataUrl(file);

      const res = await fetch("/api/riddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl,
          mode,
          detail,
          includeSolution: true
        })
      });

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to generate riddle.");

      setRiddle(json.riddle || "");
      setSolution(json.solution || "");
      setAnswer(json.answer || "");
      setFocus(json.focus || "");
      setDifficulty(json.difficulty || mode);
      setProgress(100);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setProgress(0);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  async function copyRiddle() {
    try {
      await navigator.clipboard.writeText(riddle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="container">
      <h1 style={{ margin: "6px 0 14px" }}>Caption Writer</h1>

      <div className="row">
        <div className="card">
          <div style={{ display: "grid", gap: 10 }}>
            <label className="badge">1) Upload an image</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="badge">Mode</label>
                <select className="input" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="badge">Vision detail</label>
                <select className="input" value={detail} onChange={(e) => setDetail(e.target.value as Detail)}>
                  <option value="auto">Auto</option>
                  <option value="low">Low (cheaper)</option>
                  <option value="high">High (more detail)</option>
                </select>
              </div>
            </div>

            <button className="btn" disabled={!canRun} onClick={createRiddle}>
              {loading ? `Generating… ${progress}%` : "Create riddle"}
            </button>

            {loading && (
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "rgba(255,255,255,0.35)"
                  }}
                />
              </div>
            )}

            {error && <div className="mono" style={{ color: "#ffb4b4" }}>❌ {error}</div>}
          </div>
        </div>

        <div className="card">
          <label className="badge">2) Guess first — then reveal</label>

          {preview ? (
            <div style={{ display: "grid", gap: 10 }}>
              <BlurredImage src={preview} revealed={revealed} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" disabled={!preview} onClick={() => setRevealed((v) => !v)}>
                  {revealed ? "Hide" : "Reveal"}
                </button>

                <span className="badge">Difficulty: {difficulty}</span>
                {focus && <span className="badge">Focus: {focus}</span>}
              </div>
            </div>
          ) : (
            <div className="mono" style={{ opacity: 0.8 }}>
              Upload an image to start.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <label className="badge">3) The riddle</label>

        {riddle ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="mono" style={{ fontSize: 16 }}>{riddle}</div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={copyRiddle} disabled={!riddle}>
                {copied ? "✅ Copied" : "Copy riddle"}
              </button>

              <details>
                <summary className="btn" style={{ display: "inline-block" }}>
                  Show solution
                </summary>
                <div style={{ marginTop: 10 }} className="mono">
                  <div><b>Answer:</b> {answer || "(unknown)"}</div>
                  <div style={{ marginTop: 6 }}><b>Explanation:</b> {solution || "(none)"}</div>
                </div>
              </details>
            </div>
          </div>
        ) : (
          <div className="mono" style={{ opacity: 0.8 }}>
            Click “Create riddle” to generate one.
          </div>
        )}
      </div>
    </div>
  );
}
