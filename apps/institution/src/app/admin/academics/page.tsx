import { Suspense } from "react";
import { InlineLoading } from "@eduos/ui";
import { AcademicsView } from "@/components/admin/academics/AcademicsView";

export default function AdminAcademicsPage() {
  return (
    <Suspense fallback={<InlineLoading />}>
      <AcademicsView />
    </Suspense>
  );
}
