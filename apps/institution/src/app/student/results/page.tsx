import { redirect } from "next/navigation";
import { STUDENT_ROUTES } from "@eduos/constants";

export default function Page() {
  redirect(STUDENT_ROUTES.results);
}
