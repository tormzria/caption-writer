import "./globals.css";

export const metadata = {
  title: "Caption Writer",
  description: "Upload an image → get a riddle + solution."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
