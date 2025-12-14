export function BlurredImage({
  src,
  revealed,
}: {
  src: string;
  revealed: boolean;
}) {
  return (
    <img
      src={src}
      style={{
        width: "100%",
        marginTop: 16,
        filter: revealed ? "none" : "blur(14px)",
        transition: "filter 0.25s ease",
      }}
    />
  );
}