import { StudentAlbumDetail } from "@/components/student/gallery/StudentAlbumDetail";

type Props = { params: Promise<{ id: string }> };

export default async function StudentGalleryAlbumPage({ params }: Props) {
  const { id } = await params;
  return <StudentAlbumDetail albumId={id} />;
}
