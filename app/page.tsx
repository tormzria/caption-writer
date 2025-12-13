"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!file) return;
    setLoading(true);
    setCopied(false);

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/caption", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();
    setCaption(json.caption || "Error generating caption.");
    setLoading(false);
  }

  async function copyCaption() {
    if (!caption) return;
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>AI Caption Writer</h1>
      <p>Upload an image and get a neutral, factual caption.</p>

      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate caption"}
      </button>

      {caption && (
        <>
          <pre style={{ marginTop: 16 }}>{caption}</pre>

          <button onClick={copyCaption}>
            {copied ? "✔ Copied!" : "Copy caption"}
          </button>
        </>
      )}

      <hr style={{ margin: "24px 0" }} />

      <a
        href="https://www.buymeacoffee.com/tormzria"
        target="_blank"
        rel="noreferrer"
      >
        ☕ Buy me a coffee
      </a>
    </main>
  );
}