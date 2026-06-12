import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={{ name: session.name, email: session.email }} />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
