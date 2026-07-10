import { redirect } from "next/navigation";

export default function SuperAdminBrandingRedirect() {
  redirect("/super-admin/settings");
}

