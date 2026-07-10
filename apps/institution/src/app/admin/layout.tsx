import "@eduos/ui/styles/tokens.css";
import "@eduos/ui/styles/globals.css";
import { AdminScopeProvider } from "@/components/admin/AdminScopeContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminScopeProvider>{children}</AdminScopeProvider>;
}
