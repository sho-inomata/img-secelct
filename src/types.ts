export interface ImageInfo {
  id: string;
  file: File;
  url: string;
  name: string;
  isMarkedForMosaic: boolean;
  isSelected: boolean; // 選択状態を追加
}

export interface ImageListProps {
  images: ImageInfo[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onToggleMosaic: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export interface ImagePreviewProps {
  selectedImage: ImageInfo | null;
}
