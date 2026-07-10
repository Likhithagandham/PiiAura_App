// pdf-lib is dynamically imported inside buildStudentIdCardPdf so it is only
// loaded when this function is actually called, keeping the server cold-start
// cost proportional to actual usage of the ID card feature.

export interface StudentIdCardPdfInput {
  institutionName: string;
  studentName: string;
  studentId: string;
  course: string;
  intake: string;
  photoUrl?: string | null;
}

const CARD_WIDTH = 243;
const CARD_HEIGHT = 153;

async function fetchPhotoBytes(
  url: string,
): Promise<{ bytes: Uint8Array; type: "png" | "jpg" } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (contentType.includes("png")) return { bytes, type: "png" };
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      return { bytes, type: "jpg" };
    }
    return { bytes, type: "png" };
  } catch {
    return null;
  }
}

export async function buildStudentIdCardPdf(input: StudentIdCardPdfInput): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const PRIMARY = rgb(0.102, 0.373, 0.29);
  const PRIMARY_LIGHT = rgb(0.91, 0.96, 0.94);
  const TEXT = rgb(0.1, 0.1, 0.1);
  const TEXT_MUTED = rgb(0.33, 0.33, 0.33);
  const WHITE = rgb(1, 1, 1);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([CARD_WIDTH, CARD_HEIGHT]);

  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 0,
    y: CARD_HEIGHT - 38,
    width: CARD_WIDTH,
    height: 38,
    color: PRIMARY,
  });

  const institutionLines = wrapText(input.institutionName, 28);
  let headerY = CARD_HEIGHT - 16;
  for (const line of institutionLines.slice(0, 2)) {
    page.drawText(line, {
      x: CARD_WIDTH / 2 - fontBold.widthOfTextAtSize(line, 9) / 2,
      y: headerY,
      size: 9,
      font: fontBold,
      color: WHITE,
    });
    headerY -= 11;
  }

  page.drawText(`Student ID · ${input.intake}`, {
    x: CARD_WIDTH / 2 - fontRegular.widthOfTextAtSize(`Student ID · ${input.intake}`, 6.5) / 2,
    y: CARD_HEIGHT - 32,
    size: 6.5,
    font: fontRegular,
    color: rgb(0.9, 0.95, 0.93),
  });

  const photoX = 14;
  const photoY = 28;
  const photoSize = 72;

  page.drawRectangle({
    x: photoX,
    y: photoY,
    width: photoSize,
    height: photoSize,
    color: PRIMARY_LIGHT,
    borderColor: PRIMARY,
    borderWidth: 1.5,
  });

  if (input.photoUrl) {
    const photo = await fetchPhotoBytes(input.photoUrl);
    if (photo) {
      const image =
        photo.type === "jpg"
          ? await pdf.embedJpg(photo.bytes)
          : await pdf.embedPng(photo.bytes);
      page.drawImage(image, {
        x: photoX + 2,
        y: photoY + 2,
        width: photoSize - 4,
        height: photoSize - 4,
      });
    }
  }

  const textX = photoX + photoSize + 12;
  let textY = CARD_HEIGHT - 52;

  page.drawText(input.studentName, {
    x: textX,
    y: textY,
    size: 11,
    font: fontBold,
    color: TEXT,
    maxWidth: CARD_WIDTH - textX - 10,
  });
  textY -= 16;

  page.drawText(input.course, {
    x: textX,
    y: textY,
    size: 8.5,
    font: fontRegular,
    color: TEXT_MUTED,
    maxWidth: CARD_WIDTH - textX - 10,
  });
  textY -= 12;

  page.drawText(`AY ${input.intake}`, {
    x: textX,
    y: textY,
    size: 7.5,
    font: fontRegular,
    color: TEXT_MUTED,
  });

  page.drawLine({
    start: { x: textX, y: 38 },
    end: { x: CARD_WIDTH - 12, y: 38 },
    thickness: 0.75,
    color: rgb(0.82, 0.91, 0.88),
    dashArray: [3, 2],
  });

  page.drawText(input.studentId, {
    x: textX,
    y: 22,
    size: 9,
    font: fontBold,
    color: PRIMARY,
  });

  page.drawRectangle({
    x: 0,
    y: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderColor: PRIMARY,
    borderWidth: 2,
  });

  return pdf.save();
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}
