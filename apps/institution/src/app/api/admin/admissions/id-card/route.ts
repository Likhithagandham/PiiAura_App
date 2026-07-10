import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { buildStudentIdCardPdf } from "@/lib/admin/student-id-card-pdf";
import { getAdmissionsData } from "@/lib/services/admissions.service";
import { getInstitutionName } from "@/lib/services/tenant-server";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  const format = searchParams.get("format") ?? "pdf";

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  let app: {
    applicantName: string;
    course: string;
    intake: string;
    enrolledStudentId: string | null;
    photoUrl?: string | null;
    photoS3Key?: string | null;
  } | null = null;

  const overview = await getAdmissionsData(request, auth.subdomain);
  const found = overview.applications.find((a) => a.id === applicationId);
  if (found) {
    app = {
      applicantName: found.applicantName,
      course: found.course,
      intake: found.intake || overview.intakes[0] || "",
      enrolledStudentId: found.enrolledStudentId ?? null,
      photoUrl: found.photoUrl,
      photoS3Key: found.photoS3Key,
    };
  }

  if (!app?.enrolledStudentId) {
    return NextResponse.json({ error: "Student not enrolled" }, { status: 400 });
  }

  const institution = await getInstitutionName(auth.subdomain);
  const name = app.applicantName;
  const course = app.course;
  const studentId = app.enrolledStudentId;
  const intake = app.intake;
  const photoUrl = app.photoUrl ?? "";
  const photoKey = app.photoS3Key ?? "—";

  if (format === "pdf") {
    const pdfBytes = await buildStudentIdCardPdf({
      institutionName: institution,
      studentName: name,
      studentId,
      course,
      intake,
      photoUrl: photoUrl || null,
    });

    const filename = `id-card-${studentId.replace(/[^a-zA-Z0-9-_]/g, "-")}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const safeName = escapeHtml(name);
  const safeInstitution = escapeHtml(institution);
  const safeCourse = escapeHtml(course);
  const safeStudentId = escapeHtml(studentId);
  const safeIntake = escapeHtml(intake);
  const safePhotoKey = escapeHtml(photoKey);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Student ID — ${safeName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #f4f6f5; }
    .toolbar { max-width: 400px; margin: 0 auto 1rem; display: flex; gap: 0.75rem; }
    .toolbar a, .toolbar button {
      padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; cursor: pointer;
      text-decoration: none; display: inline-block;
    }
    .primary { background: #1a5f4a; color: #fff; border: 1px solid #1a5f4a; }
    .secondary { background: #fff; color: #1a5f4a; border: 1px solid #1a5f4a; }
    .card {
      width: 340px; margin: 0 auto; border: 2px solid #1a5f4a; border-radius: 16px;
      overflow: hidden; background: #fff;
    }
    .header { background: linear-gradient(135deg, #1a5f4a, #2d8a6e); color: #fff; padding: 1rem; text-align: center; }
    .body { padding: 1.25rem; text-align: center; }
    .photo { width: 96px; height: 96px; border-radius: 12px; object-fit: cover; margin: 0 auto 1rem; display: block; background: #e8f5f0; }
  </style>
</head>
<body>
  <div class="toolbar">
    <a class="primary" href="/api/admin/admissions/id-card?applicationId=${encodeURIComponent(applicationId)}&format=pdf" target="_blank">Download PDF</a>
    <button type="button" class="secondary" onclick="window.close()">Close</button>
  </div>
  <div class="card">
    <div class="header"><h1 style="margin:0;font-size:1rem">${safeInstitution}</h1></div>
    <div class="body">
      ${photoUrl ? `<img class="photo" src="${escapeHtml(photoUrl)}" alt="" />` : `<div class="photo"></div>`}
      <p style="font-weight:700;margin:0 0 0.25rem">${safeName}</p>
      <p style="font-size:0.8125rem;color:#555">${safeCourse}<br/>${safeIntake}</p>
      <p style="font-family:monospace;color:#1a5f4a;font-weight:600">${safeStudentId}</p>
    </div>
  </div>
  <p style="text-align:center;font-size:0.7rem;color:#888">Photo: ${safePhotoKey}</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
