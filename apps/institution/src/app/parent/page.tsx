import { PARENT_ROUTES } from "@eduos/constants";
import { redirect } from "next/navigation";

export default function ParentIndexPage() {
  redirect(PARENT_ROUTES.dashboard);
}
