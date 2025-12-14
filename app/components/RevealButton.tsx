export function RevealButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ marginTop: 16 }}>
      Reveal image
    </button>
  );
}