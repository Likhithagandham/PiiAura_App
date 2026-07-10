import { ADMIN_ROUTES } from "@eduos/constants";
import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  redirect(ADMIN_ROUTES.dashboard);
}
