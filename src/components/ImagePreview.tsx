import React from 'react';
import { ImagePreviewProps } from '../types';

const ImagePreview: React.FC<ImagePreviewProps> = ({ selectedImage }) => {

  // Handle sending to mosaic editor
  const handleSendToMosaicEditor = () => {
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
    <div className="flex flex-col h-full">
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
          {selectedImage.isMarkedForMosaic && (
            <button 
              onClick={handleSendToMosaicEditor}
              className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"

            >
              モザイクエディタで開く
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
