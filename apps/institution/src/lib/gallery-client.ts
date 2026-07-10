"use client";

/**
 * Gallery upload orchestration — uses api-client for BFF calls; XHR only for direct R2 PUT.
 */

import type { GalleryImage, PresignFileSpec, UploadQueueItem } from "@eduos/types";
import { apiGet, apiSend, apiSendForm } from "./api-client";

export async function presignClient(albumId: string, files: PresignFileSpec[]) {
  return apiSend<{ uploads: Array<{ imageId: string; stagingKey: string; presignedUrl: string }> }>(
    "/api/admin/gallery/uploads/presign",
    "POST",
    { albumId, files },
  );
}

async function uploadStaging(
  albumId: string,
  imageId: string,
  file: File,
  presignedUrl: string,
  onProgress?: (pct: number) => void,
) {
  if (presignedUrl.includes("sandbox-s3.local")) {
    const form = new FormData();
    form.append("file", file);
    form.append("albumId", albumId);
    await apiSendForm<{ success: boolean }>(
      `/api/admin/gallery/uploads/${imageId}/staging`,
      form,
    );
    onProgress?.(100);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export async function confirmClient(albumId: string, imageId: string): Promise<GalleryImage> {
  return apiSend<GalleryImage>("/api/admin/gallery/uploads/confirm", "POST", { albumId, imageId });
}

export async function pollImageStatus(albumId: string, imageId: string): Promise<GalleryImage> {
  for (let i = 0; i < 40; i += 1) {
    const json = await apiGet<GalleryImage>(
      `/api/admin/gallery/uploads/${encodeURIComponent(imageId)}/status?albumId=${encodeURIComponent(albumId)}`,
    );
    if (json.processingStatus === "ready") return json;
    if (json.processingStatus === "failed") {
      throw new Error(json.processingError ?? "Processing failed");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Processing timed out");
}

export async function runUploadQueueItem(
  albumId: string,
  item: UploadQueueItem,
  uploadSpec: { imageId: string; presignedUrl: string },
  onUpdate: (patch: Partial<UploadQueueItem>) => void,
): Promise<GalleryImage> {
  onUpdate({ status: "uploading", progress: 0 });
  await uploadStaging(albumId, uploadSpec.imageId, item.file, uploadSpec.presignedUrl, (pct) => {
    onUpdate({ progress: pct });
  });
  onUpdate({ status: "processing", progress: 100, imageId: uploadSpec.imageId });
  await confirmClient(albumId, uploadSpec.imageId);
  const image = await pollImageStatus(albumId, uploadSpec.imageId);
  onUpdate({ status: "ready", progress: 100, imageId: uploadSpec.imageId });
  return image;
}

export async function uploadFilesToAlbum(
  albumId: string,
  files: File[],
  onQueueUpdate: (items: UploadQueueItem[]) => void,
): Promise<void> {
  const queue: UploadQueueItem[] = files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),
    status: "queued",
    progress: 0,
  }));
  onQueueUpdate([...queue]);

  const specs: PresignFileSpec[] = files.map((f) => ({
    fileName: f.name,
    contentType: f.type || "application/octet-stream",
    fileSize: f.size,
  }));
  const { uploads } = await presignClient(albumId, specs);

  for (let i = 0; i < queue.length; i += 1) {
    const item = queue[i]!;
    const spec = uploads[i]!;
    try {
      await runUploadQueueItem(albumId, item, spec, (patch) => {
        Object.assign(item, patch);
        onQueueUpdate([...queue]);
      });
    } catch (err) {
      item.status = "failed";
      item.error = err instanceof Error ? err.message : "Upload failed";
      onQueueUpdate([...queue]);
    }
  }
}
