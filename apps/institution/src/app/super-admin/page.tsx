import { redirect } from "next/navigation";
import { SUPER_ADMIN_ROUTES } from "@eduos/constants";

export default function SuperAdminIndexPage() {
  redirect(SUPER_ADMIN_ROUTES.dashboard);
}

