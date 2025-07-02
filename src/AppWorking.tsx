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
  const [mosaicCounter, setMosaicCounter] = useState(0);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId) || null;

  // =============== Helpers ===============
  const mosaicCount = useMemo(() => images.filter((img) => img.isMarkedForMosaic).length, [images]); // 現在チェックされている枚数


  const handleFileUpload = useCallback(
    (files: FileList) => {
      const fileArray = Array.from(files);
      if (images.length + fileArray.length > MAX_FILES) {
        alert(`最大${MAX_FILES}ファイルまでアップロードできます。`);
        return;
      }
      const valid = fileArray.filter((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`サポートされていない形式: ${file.name}`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`ファイルサイズが大きすぎます: ${file.name}`);
          return false;
        }
        return true;
      });
      if (!valid.length) return;
      const newImages: ImageInfo[] = valid.map((file) => ({
        id: uuidv4(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isMarkedForMosaic: false,
        isSelected: false,
      }));
      setImages((prev) => [...prev, ...newImages]);
      if (selectedImageId === null) setSelectedImageId(newImages[0].id);
    },
    [images.length, selectedImageId]
  );

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFileUpload(e.target.files);
      e.target.value = '';
    }
  }, [handleFileUpload]);

  // ===== Drag & Drop =====
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFileUpload(e.dataTransfer.files);
    dropAreaRef.current?.classList.remove('bg-blue-50', 'border-blue-300');
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropAreaRef.current?.classList.add('bg-blue-50', 'border-blue-300');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dropAreaRef.current?.classList.remove('bg-blue-50', 'border-blue-300');
  }, []);

  // ===== Image actions =====
  const handleToggleMosaic = useCallback((id: string) => {
    setImages((prev) => prev.map((img) => {
      if (img.id !== id) return img;
      const toggled = !img.isMarkedForMosaic;
      // カウンタはオンにした時だけインクリメント、オフでは変えない
      if (toggled) setMosaicCounter((c) => c + 1);
      return { ...img, isMarkedForMosaic: toggled, isSelected: toggled };
    }));
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // ===== Downloads & Count Reset =====
  const handleDownloadSelected = useCallback(() => {
    const sel = images.filter((i) => i.isMarkedForMosaic);
    if (sel.length) downloadImagesAsZip(sel, 'mosaic-images.zip');
  }, [images]);

  const handleDownloadNonSelected = useCallback(() => {
    const non = images.filter((i) => !i.isMarkedForMosaic);
    if (non.length) downloadImagesAsZip(non, 'non-mosaic-images.zip');
  }, [images]);

  const handleDownloadAll = useCallback(() => {
    if (images.length) downloadImagesAsZip(images, 'all-images.zip');
  }, [images]);

  // ===== Reset Count =====
  const handleResetCount = useCallback(() => {
    if (mosaicCounter === 0) return;
    setMosaicCounter(0);
  }, [mosaicCounter]);



  // ===== Keyboard navigation =====
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (images.length === 0) return;
      const currentIdx = selectedImageId ? images.findIndex((i) => i.id === selectedImageId) : -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = currentIdx === -1 ? 0 : (currentIdx + 1) % images.length;
        setSelectedImageId(images[next].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = currentIdx === -1 ? images.length - 1 : (currentIdx - 1 + images.length) % images.length;
        setSelectedImageId(images[prev].id);
      } else if (e.key === 'Enter' && selectedImageId) {
        e.preventDefault();
        handleToggleMosaic(selectedImageId);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleResetCount();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [images, selectedImageId, handleToggleMosaic, handleResetCount]);

  // =============== Render ===============
  return (
    <div
      className="min-h-screen p-4 md:p-8 drop-area"
      ref={dropAreaRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Header */}
      <header className="max-w-7xl mx-auto p-4 mb-6 text-center">
        <h1 className="text-3xl font-bold text-red-600">GenScope</h1>
        {/* Mosaic check counter display */}
        <div className="mt-2 text-sm text-blue-600">チェック数: {mosaicCounter} 枚</div>
        <p className="mt-2">画像を選択、プレビュー、モザイク対象としてマークし、選択した画像をダウンロードできます。</p>
      </header>

      {/* Preview & List */}
      <main className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        <ImagePreview
            selectedImage={selectedImage}
            images={images}
            selectedImageId={selectedImageId}
            onSelectImage={setSelectedImageId}
            onToggleMosaic={handleToggleMosaic}
            mosaicCounter={mosaicCounter}
          />
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
        <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center" onClick={() => fileInputRef.current?.click()}>
          画像をアップロード
        </button>
        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={handleFileInputChange} className="hidden" />

        {/* Download buttons */}
        <button disabled={mosaicCount === 0} onClick={handleDownloadSelected} className={`py-2 px-4 rounded-md flex items-center ${mosaicCount===0?'bg-gray-300 cursor-not-allowed text-gray-500':'bg-blue-500 hover:bg-blue-600 text-white'}`}>モザイク対象 ({mosaicCount}) DL</button>
        <button disabled={images.length===0||mosaicCount===images.length} onClick={handleDownloadNonSelected} className={`py-2 px-4 rounded-md flex items-center ${images.length===0||mosaicCount===images.length?'bg-gray-300 cursor-not-allowed text-gray-500':'bg-green-500 hover:bg-green-600 text-white'}`}>非モザイク DL</button>
        <button disabled={images.length===0} onClick={handleDownloadAll} className={`py-2 px-4 rounded-md flex items-center ${images.length===0?'bg-gray-300 cursor-not-allowed text-gray-500':'bg-purple-500 hover:bg-purple-600 text-white'}`}>すべて DL ({images.length})</button>
        {/* Reset count button */}
        <button disabled={mosaicCounter===0} onClick={handleResetCount} className={`py-2 px-4 rounded-md flex items-center ${mosaicCounter===0?'bg-gray-300 cursor-not-allowed text-gray-500':'bg-red-500 hover:bg-red-600 text-white'}`}>カウントリセット</button>


        <p className="w-full mt-2 text-sm text-gray-600 text-center">画像はブラウザ内で処理され、サーバーにアップロードされません。最大 {MAX_FILES} ファイル、1ファイルあたり最大 {MAX_FILE_SIZE_MB}MB。</p>
      </footer>
    </div>
  );
};

export default App;
