async function sendFeedback(value: string) {
  await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      feedback: value,
      timestamp: Date.now(),
    }),
  });
}

export function Feedback({ onDone }: { onDone: () => void }) {
  async function handle(value: string) {
    await sendFeedback(value);
    onDone();
  }

  return (
    <div style={{ marginTop: 24 }}>
      <p>Was it clear?</p>

      <button onClick={() => handle("easy")}>Too easy</button>
      <button onClick={() => handle("right")}>Just right</button>
      <button onClick={() => handle("hard")}>Too hard</button>
    </div>
  );
}