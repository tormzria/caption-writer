import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Riddle",
  description: "A small riddle about what you see.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#fff",
          color: "#000",
        }}
      >
        {children}
      </body>
    </html>
  );
}
