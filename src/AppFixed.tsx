import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageList from './components/ImageList';
import ImagePreview from './components/ImagePreview';
import { downloadImagesAsZip } from './utils/zip';
import { ImageInfo } from './types';
import './App.css';

const MAX_FILES = 1000;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const App: React.FC = () => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId) || null;

  // =========================
  // Helpers
  // =========================
  const mosaicCount = useMemo(() => images.filter((img) => img.isMarkedForMosaic).length, [images]);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);
      if (images.length + fileArray.length > MAX_FILES) {
        alert(`最大${MAX_FILES}ファイルまでアップロードできます。`);
        return;
      }
      const validFiles = fileArray.filter((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`サポートされていないファイル形式です: ${file.name}`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`ファイルサイズが大きすぎます: ${file.name}`);
          return false;
        }
        return true;
      });
      if (validFiles.length === 0) return;
      const newImages = validFiles.map((file) => ({
        id: uuidv4(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isMarkedForMosaic: false,
        isSelected: false,
      }));
      setImages((prev) => [...prev, ...newImages]);
      if (selectedImageId === null && newImages.length > 0) setSelectedImageId(newImages[0].id);
    },
    [images.length, selectedImageId]
  );

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      e.target.value = '';
    }
  }, [handleFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
    dropAreaRef.current?.classList.remove('bg-blue-50', 'border-blue-300');
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current?.classList.add('bg-blue-50', 'border-blue-300');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dropAreaRef.current?.classList.remove('bg-blue-50', 'border-blue-300');
  }, []);

  const handleToggleMosaic = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, isMarkedForMosaic: !img.isMarkedForMosaic, isSelected: !img.isMarkedForMosaic } : img
      )
    );
  }, []);

 = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, isSelected: !img.isSelected, isMarkedForMosaic: !img.isSelected } : img
      )
    );
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => {
      const toDel = prev.find((img) => img.id === id);
      if (toDel) URL.revokeObjectURL(toDel.url);
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleDownloadSelected = useCallback(() => {
    const selected = images.filter((img) => img.isMarkedForMosaic);
    if (selected.length) downloadImagesAsZip(selected, 'mosaic-images.zip');
  }, [images]);

  const handleDownloadNonSelected = useCallback(() => {
    const non = images.filter((img) => !img.isMarkedForMosaic);
    if (non.length) downloadImagesAsZip(non, 'non-mosaic-images.zip');
  }, [images]);

  const handleDownloadAll = useCallback(() => {
    if (images.length) downloadImagesAsZip(images, 'all-images.zip');
  }, [images]);

  const handleSendToMosaicEditor = useCallback(() => {
    const mosaicImages = images.filter((img) => img.isMarkedForMosaic);
    if (mosaicImages.length === 0) {
      alert('モザイク対象がありません');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      window.open(`https://mosaic-art-editor.windsurf.build/?image=${encodeURIComponent(base64)}`, '_blank');
    };
    reader.readAsDataURL(mosaicImages[0].file);
  }, [images]);

  // =========================
  // Keyboard Navigation (Arrow keys & Enter)
  // =========================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (selectedImageId === null) {
          setSelectedImageId(images[0].id);
          return;
        }
        const currentIndex = images.findIndex((img) => img.id === selectedImageId);
        const nextIndex = (currentIndex + 1) % images.length;
        setSelectedImageId(images[nextIndex].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedImageId === null) {
          setSelectedImageId(images[images.length - 1].id);
          return;
        }
        const currentIndex = images.findIndex((img) => img.id === selectedImageId);
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setSelectedImageId(images[prevIndex].id);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedImageId) handleToggleMosaic(selectedImageId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images, selectedImageId, handleToggleMosaic]);

  /* ================= Render ================= */
  return (
    <div
      className="min-h-screen p-4 md:p-8 drop-area"
      ref={dropAreaRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto sith-container p-4 mb-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">GenScope</h1>
        <p className="mt-2">画像を選択、プレビュー、モザイク対象としてマークし、選択した画像をダウンロードできます。</p>
      </header>

      {/* Preview & List */}
      <main className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        <ImagePreview selectedImage={selectedImage} />
        <ImageList
          images={images}
          selectedImageId={selectedImageId}
          onSelectImage={setSelectedImageId}
          onToggleMosaic={handleToggleMosaic}
          onDeleteImage={handleDeleteImage}
          horizontal
        />
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 flex flex-wrap gap-3 items-center">
        {/* Upload */}
        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          画像をアップロード
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept=".jpg,.jpeg,.png,.webp" multiple className="hidden" />

        {/* download buttons ... (trimmed for brevity) */}
        <button onClick={handleDownloadSelected} disabled={mosaicCount === 0} className={`py-2 px-4 rounded-md flex items-center ${mosaicCount === 0 ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}>モザイク対象 ({mosaicCount}) をDL</button>
        <button onClick={handleDownloadNonSelected} disabled={images.length === 0 || mosaicCount === images.length} className="py-2 px-4 rounded-md bg-green-500 text-white">非モザイクをDL</button>
        <button onClick={handleDownloadAll} disabled={images.length === 0} className="py-2 px-4 rounded-md bg-purple-500 text-white">すべてDL ({images.length})</button>
        <button onClick={handleSendToMosaicEditor} disabled={!images.some((i) => i.isMarkedForMosaic)} className="py-2 px-4 rounded-md bg-yellow-500 text-white">モザイクエ디タへ</button>

        <p className="w-full mt-2 text-sm text-gray-600 text-center">
          画像はブラウザ内で処理され、サーバーにアップロードされません。最大 {MAX_FILES} ファイル、1ファイルあたり最大 {MAX_FILE_SIZE_MB}MB まで対応
        </p>
      </footer>
    </div>
  );
};

export default App;
