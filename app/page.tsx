import { redirect } from "next/navigation";

// Redirect root to (public) group
export default function RootPage() {
  redirect("/home");
}
