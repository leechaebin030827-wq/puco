import PublicNav from "@/components/public/PublicNav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="pt-16">{children}</main>
    </>
  );
}
