import { AlbumDetailView } from "@/components/admin/gallery/AlbumDetailView";

type Props = { params: Promise<{ albumId: string }> };

export default async function AdminGalleryAlbumPage({ params }: Props) {
  const { albumId } = await params;
  return <AlbumDetailView albumId={albumId} />;
}
