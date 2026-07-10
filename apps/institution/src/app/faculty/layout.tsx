import "@eduos/ui/styles/tokens.css";
import "@eduos/ui/styles/globals.css";
import { FacultyScopeProvider } from "@/components/faculty/FacultyScopeContext";

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return <FacultyScopeProvider>{children}</FacultyScopeProvider>;
}
