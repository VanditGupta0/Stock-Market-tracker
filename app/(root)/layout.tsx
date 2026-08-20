import Header from "@/components/Header";

export default function RootSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen text-slate-300">
      <Header />
      <div className="site-container py-8 md:py-10">{children}</div>
    </main>
  );
}
