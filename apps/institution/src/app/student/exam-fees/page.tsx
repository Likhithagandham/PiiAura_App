import { redirect } from "next/navigation";
import { STUDENT_ROUTES } from "@eduos/constants";

export default function StudentExamFeesRedirectPage() {
  redirect(`${STUDENT_ROUTES.fees}?tab=exam`);
}
