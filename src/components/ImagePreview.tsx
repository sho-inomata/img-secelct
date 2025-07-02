import React, { useRef, useState, useEffect } from 'react';
import ImageList from './ImageList';
import { ImagePreviewProps } from '../types';

interface ExtendedPreviewProps extends ImagePreviewProps {
  images: import('../types').ImageInfo[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onToggleMosaic: (id: string) => void;
  mosaicCounter: number;
}

const ImagePreview: React.FC<ExtendedPreviewProps> = ({ selectedImage, images, selectedImageId, onSelectImage, onToggleMosaic, mosaicCounter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    const doc: any = document;
    if (!isFullscreen) {
      // Enter
      const request = (
        elem.requestFullscreen ||
        (elem as any).webkitRequestFullscreen ||
        (elem as any).mozRequestFullScreen ||
        (elem as any).msRequestFullscreen
      );
      if (request) {
        request.call(elem).catch((err: any) => console.error('Fullscreen error', err));
      }
    } else {
      // Exit
      const exit = (
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen
      );
      if (exit) {
        exit.call(doc);
      }
    }
  };

  // Sync state when user exits fullscreen via Esc key, etc.
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ==== mosaic editor removed ====
  /* const handleSendToMosaicEditor = () => {
    if (selectedImage && selectedImage.isMarkedForMosaic) {
      try {
        console.log('Opening mosaic editor for image:', selectedImage.name);
        
        // FileReaderを使用してbase64データを取得
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            const base64Data = result.split(',')[1];
            
            // URLを作成
            const url = `https://mosaic-art-editor.windsurf.build/?image=${encodeURIComponent(base64Data)}`;
            console.log('Generated URL for mosaic editor');
            
            // ユーザーに直接URLを表示
            alert('モザイクエディターURLを新しいタブで開きます。\nポップアップがブロックされた場合は、ブラウザの設定で許可してください。');
            
            // ウィンドウを直接開く
            const newWindow = window.open(url, '_blank');
            
            // ポップアップがブロックされた場合の処理
            if (newWindow === null) {
              console.warn('Popup was blocked');
              // ユーザーにリンクをクリックするよう促す
              const confirmOpen = confirm('ポップアップがブロックされました。リンクを手動で開きますか？');
              if (confirmOpen) {
                // リンクを作成してクリックさせる
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          } catch (error) {
            console.error('Error opening mosaic editor:', error);
            alert('モザイクエディタを開く際にエラーが発生しました。');
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
          alert('ファイルの読み込み中にエラーが発生しました。');
        };
        
        reader.readAsDataURL(selectedImage.file);
      } catch (error) {
        console.error('Error in handleSendToMosaicEditor:', error);
        alert('モザイクエディタを開く際にエラーが発生しました。');
      }
    }
  };
*/

  if (!selectedImage) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-xl">画像を選択してください</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full relative">
      {/* Count overlay when fullscreen */}
      {isFullscreen && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md z-10">
          チェック数: {mosaicCounter} 枚
        </div>
      )}
      {/* Fullscreen toggle button */}
      <button
        onClick={handleToggleFullscreen}
        className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md hover:bg-gray-700 z-10"
      >
        {isFullscreen ? '閉じる' : '全画面'}
      </button>
      {/* Title */}
      <h2 className="text-xl font-bold mb-2">プレビュー</h2>
      
      {/* Main container - takes full height minus the title */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Image container - takes 70% of the available height */}
        <div className="bg-gray-100 rounded-lg flex items-center justify-center mb-3" style={{ height: '70%' }}>
          <img 
            src={selectedImage.url} 
            alt={selectedImage.name} 
            className="object-contain" 
            style={{ maxHeight: '100%', maxWidth: '100%' }}
          />
        </div>
        
        {/* Info section - takes remaining height with scroll if needed */}
        <div className="overflow-y-auto flex-grow">
          <h3 className="font-medium">ファイル情報</h3>
          <p className="text-sm text-gray-600 break-all">{selectedImage.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {selectedImage.isMarkedForMosaic && (
            <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md text-sm">
              この画像はモザイク処理対象としてマークされています
            </div>
          )}

        </div>
      </div>
      {/* When fullscreen, show list at bottom */}
      {isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-2">
          <ImageList
            images={images}
            selectedImageId={selectedImageId}
            onSelectImage={onSelectImage}
            onToggleMosaic={onToggleMosaic}
            onDeleteImage={() => {}}
            horizontal
          />
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
