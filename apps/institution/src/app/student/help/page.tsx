"use client";

import { StudentGrievancesPanel } from "@/components/student/panels/StudentGrievancesPanel";
import { StudentShell } from "@/components/student/StudentShell";

const PORTAL_TUTORIAL_VIDEO_URL = "https://www.youtube.com/watch?v=Bb4jVGiQKKA&t=26s";
const PORTAL_TUTORIAL_EMBED_URL = "https://www.youtube.com/embed/Bb4jVGiQKKA?start=26";

export default function StudentHelpPage() {
  return (
    <StudentShell title="Help">
      <section className="eduos-panel" style={{ marginBottom: "1rem" }}>
        <h2 className="eduos-subsection-title" style={{ marginTop: 0 }}>
          Student portal tutorial
        </h2>
        <p className="eduos-section-desc" style={{ marginTop: "0.5rem" }}>
          New to the portal? Watch this short video to learn how to use dashboard, homework, exams,
          fees, and other sections.
        </p>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "720px",
            marginTop: "1rem",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            borderRadius: "var(--eduos-radius-md, 8px)",
            background: "var(--eduos-surface-muted, #f4f4f5)",
          }}
        >
          <iframe
            title="Student portal tutorial"
            src={PORTAL_TUTORIAL_EMBED_URL}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
          <a href={PORTAL_TUTORIAL_VIDEO_URL} target="_blank" rel="noopener noreferrer">
            Open video on YouTube
          </a>
        </p>
      </section>

      <p className="eduos-section-desc">
        Raise a grievance or track an issue you reported. The school admin will review and respond.
      </p>
      <StudentGrievancesPanel />
    </StudentShell>
  );
}
