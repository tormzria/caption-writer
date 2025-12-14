export function RiddleText({ text }: { text: string }) {
  return (
    <p
      style={{
        marginTop: 24,
        fontSize: "1.05rem",
        lineHeight: 1.5,
        textAlign: "center",
      }}
    >
      {text}
    </p>
  );
}