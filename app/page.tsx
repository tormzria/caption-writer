"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("/api/caption", {
      method: "POST",
      body: fd,
    });

    const json = await res.json();
    setCaption(json.caption || "Error");
    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>AI Caption Writer</h1>

      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <button onClick={generate} disabled={loading}>
        {loading ? "Working..." : "Generate caption"}
      </button>

      <pre style={{ marginTop: 16 }}>{caption}</pre>

      <hr />

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
