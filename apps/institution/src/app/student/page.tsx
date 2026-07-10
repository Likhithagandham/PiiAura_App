import { STUDENT_ROUTES } from "@eduos/constants";
import { redirect } from "next/navigation";

/** /student → dashboard (no bare segment page otherwise 404). */
export default function StudentIndexPage() {
  redirect(STUDENT_ROUTES.dashboard);
}
