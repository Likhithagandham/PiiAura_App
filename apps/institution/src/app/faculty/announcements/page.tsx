import { redirect } from "next/navigation";
import { FACULTY_ROUTES } from "@eduos/constants";

export default function FacultyAnnouncementsRedirect() {
  redirect(FACULTY_ROUTES.announcements);
}
