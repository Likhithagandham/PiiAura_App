import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@eduos/constants";

export default function AdminCommunicationsRedirect() {
  redirect(ADMIN_ROUTES.communications);
}
