export type GalleryVisibility = "students" | "parents" | "faculty" | "staff_only" | "private";
export type ProcessingStatus = "pending" | "ready" | "failed";

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description: string;
  branchId: string;
  batchId: string | null;
  batchName: string | null;
  academicYearId: string;
  academicYearName: string;
  visibility: GalleryVisibility;
  eventTag: string;
  sortOrder: number;
  isSchoolAlbum: boolean;
  coverImageUrl: string | null;
  totalImages: number;
  createdAt: string;
  createdByName: string;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  originalFileName: string;
  fileSize: number;
  width: number;
  height: number;
  sortOrder: number;
  processingStatus: ProcessingStatus;
  processingError: string | null;
  uploadedByName: string;
  createdAt: string;
}

export interface GalleryAlbumDetail {
  album: GalleryAlbum;
  images: GalleryImage[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GalleryAlbumListResponse {
  albums: GalleryAlbum[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAlbumInput {
  title: string;
  description?: string;
  batchId?: string | null;
  academicYearId?: string;
  visibility?: GalleryVisibility;
  eventTag?: string;
}

export interface UpdateAlbumInput {
  title?: string;
  description?: string;
  visibility?: GalleryVisibility;
  eventTag?: string;
  sortOrder?: number;
}

export interface GalleryFilters {
  q?: string;
  batchId?: string;
  academicYearId?: string;
  eventTag?: string;
  dateFrom?: string;
  dateTo?: string;
  schoolOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PresignFileSpec {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignUploadItem {
  imageId: string;
  stagingKey: string;
  presignedUrl: string;
}

export interface PresignUploadResponse {
  uploads: PresignUploadItem[];
}

export interface UploadJobStatus {
  image: GalleryImage;
}

/** @deprecated Legacy flat gallery item */
export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  branchId: string | null;
  createdAt: string;
  createdByName: string;
}

/** @deprecated */
export interface CreateGalleryItemInput {
  title: string;
  caption: string;
  imageUrl: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "processing" | "ready" | "failed";
  progress: number;
  error?: string;
  imageId?: string;
}
