"use client";

import { useState } from "react";
import { ImageUpload } from "./components/ImageUpload";
import { BlurredImage } from "./components/BlurredImage";
import { RiddleText } from "./components/RiddleText";
import { RevealButton } from "./components/RevealButton";
import { Feedback } from "./components/Feedback";

export default function HomePage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [riddle, setRiddle] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function createRiddle() {
    if (!imageFile) return;

    const fd = new FormData();
    fd.append("image", imageFile);

    const res = await fetch("/api/caption", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setRiddle(data.riddle);
  }

  function reset() {
    setImageFile(null);
    setImageUrl(null);
    setRiddle(null);
    setRevealed(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      {!imageUrl && (
        <ImageUpload
          onSelect={(file, url) => {
            setImageFile(file);
            setImageUrl(url);
          }}
        />
      )}

      {imageUrl && (
        <>
          <BlurredImage src={imageUrl} revealed={revealed} />

          {!riddle && (
            <button onClick={createRiddle} style={{ marginTop: 16 }}>
              Create riddle
            </button>
          )}

          {riddle && (
            <>
              <RiddleText text={riddle} />

              {!revealed && (
                <RevealButton onClick={() => setRevealed(true)} />
              )}

              {revealed && (
                <Feedback
                  onDone={() => {
                    reset();
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}