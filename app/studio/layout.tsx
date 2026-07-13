import { requireAdmin } from "@/lib/auth";
import StudioSidebar from "@/components/studio/StudioSidebar";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 text-zinc-900">
      <StudioSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
