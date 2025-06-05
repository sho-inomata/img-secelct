export interface ImageInfo {
  id: string;
  file: File;
  url: string;
  name: string;
  isMarkedForMosaic: boolean;
}

export interface ImageListProps {
  images: ImageInfo[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onToggleMosaic: (id: string) => void;
  onDeleteImage: (id: string) => void;
}

export interface ImagePreviewProps {
  selectedImage: ImageInfo | null;
}
