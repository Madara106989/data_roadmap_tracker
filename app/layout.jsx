// app/layout.jsx
export const metadata = {
  title: "Data Roadmap Tracker",
  description: "Daily roadmap tracker for data science journey",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
