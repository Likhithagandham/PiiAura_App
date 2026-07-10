import { redirect } from "next/navigation";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";

export default function HomePage() {
  redirect(PLATFORM_OWNER_ROUTES.dashboard);
}
