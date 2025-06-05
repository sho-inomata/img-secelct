import React, { useState, useCallback, useRef, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageList from './components/ImageList';
import ImagePreview from './components/ImagePreview';
import { ImageInfo } from './types';
import { downloadImagesAsZip } from './utils/zip';
import './App.css';

const MAX_FILES = 300;
const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const App: React.FC = () => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const selectedImage = images.find(img => img.id === selectedImageId) || null;
  
  // モザイク対象の画像数をカウント
  const mosaicCount = useMemo(() => {
    return images.filter(img => img.isMarkedForMosaic).length;
  }, [images]);

  const handleFileUpload = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > MAX_FILES) {
      alert(`最大${MAX_FILES}ファイルまでアップロードできます。`);
      return;
    }
    
    // Filter files by type and size
    const validFiles = fileArray.filter(file => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`サポートされていないファイル形式です: ${file.name}\nJPEG, PNG, WebP 形式のみアップロード可能です。`);
        return false;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`ファイルサイズが大きすぎます: ${file.name}\n最大 ${MAX_FILE_SIZE_MB}MB までアップロード可能です。`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create image info objects with object URLs
    const newImages = validFiles.map(file => ({
      id: uuidv4(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isMarkedForMosaic: false,
      isSelected: false // 初期状態では選択されていない
    }));
    
    setImages(prevImages => [...prevImages, ...newImages]);
    
    // Select the first new image if no image is currently selected
    if (selectedImageId === null && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }
  }, [images.length, selectedImageId]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
      // Reset the input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  }, [handleFileUpload]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }
  }, [handleFileUpload]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.add('bg-blue-50', 'border-blue-300');
    }
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropAreaRef.current) {
      dropAreaRef.current.classList.remove('bg-blue-50', 'border-blue-300');
    }
  }, []);

  // Toggle mosaic marking - モザイク対象を切り替えるシンプルな関数
  const handleToggleMosaic = useCallback((id: string) => {
    console.log(`モザイク切り替え: ID=${id}`);
    
    // 単純に配列をコピーして変更する方法に変更
    setImages(prevImages => {
      // 配列のコピーを作成
      const newImages = [...prevImages];
      
      // 対象の画像を探す
      const index = newImages.findIndex(img => img.id === id);
      if (index === -1) return prevImages; // 見つからなければ変更なし
      
      // 新しいモザイク状態を計算
      const newMosaicState = !newImages[index].isMarkedForMosaic;
      console.log(`画像 ${id} のモザイク状態を ${newImages[index].isMarkedForMosaic} から ${newMosaicState} に変更`);
      
      // 対象の画像のモザイク状態と選択状態を変更
      newImages[index] = {
        ...newImages[index],
        isMarkedForMosaic: newMosaicState,
        isSelected: newMosaicState // モザイク対象と選択状態を連動
      };
      
      return newImages;
    });
  }, []);

  // Toggle selection - モザイク状態と連動
  const handleToggleSelect = useCallback((id: string) => {
    setImages(prevImages => {
      const targetImage = prevImages.find(img => img.id === id);
      if (!targetImage) return prevImages;
      
      const newSelectedState = !targetImage.isSelected;
      
      return prevImages.map(img => 
        img.id === id 
          ? { 
              ...img, 
              isSelected: newSelectedState,
              isMarkedForMosaic: newSelectedState // 選択状態とモザイク対象を連動させる
            } 
          : img
      );
    });
  }, []);

  // Delete image
  const handleDeleteImage = useCallback((id: string) => {
    setImages(prevImages => {
      // Find the image to delete
      const imageToDelete = prevImages.find(img => img.id === id);
      
      // Revoke the object URL to prevent memory leaks
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      
      // Remove the image from the array
      const newImages = prevImages.filter(img => img.id !== id);
      
      // If the deleted image was selected, select another image if available
      if (id === selectedImageId) {
        if (newImages.length > 0) {
          setSelectedImageId(newImages[0].id);
        } else {
          setSelectedImageId(null);
        }
      }
      
      return newImages;
    });
  }, [selectedImageId]);

  // すべての画像のモザイク状態を切り替える関数
  const handleToggleSelectAll = useCallback(() => {
    // すべてモザイク対象になっているかチェック
    const allMarkedForMosaic = images.length > 0 && images.every(img => img.isMarkedForMosaic);
    
    setImages(prevImages => 
      prevImages.map(img => ({ 
        ...img, 
        isMarkedForMosaic: !allMarkedForMosaic,
        isSelected: !allMarkedForMosaic // モザイク対象と選択状態を連動させる
      }))
    );
  }, [images]);

  // Download non-mosaic images
  const handleDownloadNonSelected = useCallback(() => {
    const nonMosaicImages = images.filter(img => !img.isMarkedForMosaic);
    if (nonMosaicImages.length === 0) return;
    
    downloadImagesAsZip(nonMosaicImages, "non-mosaic-images.zip");
  }, [images]);

  // Download mosaic marked images
  const handleDownloadSelected = useCallback(() => {
    const mosaicImages = images.filter(img => img.isMarkedForMosaic);
    if (mosaicImages.length === 0) return;
    
    downloadImagesAsZip(mosaicImages, "mosaic-images.zip");
  }, [images]);
  
  // Handle download of all images
  const handleDownloadAll = useCallback(() => {
    if (images.length === 0) {
      alert('ダウンロードできる画像がありません。');
      return;
    }
    
    downloadImagesAsZip(images, 'all-images');
  }, [images]);

  // Handle sending all mosaic-marked images to the mosaic editor
  const handleSendToMosaicEditor = useCallback(() => {
    const mosaicImages = images.filter(img => img.isMarkedForMosaic);
    
    if (mosaicImages.length === 0) {
      alert('モザイク対象としてマークされた画像がありません。');
      return;
    }
    
    // If there's only one image, open it directly
    if (mosaicImages.length === 1) {
      // 選択中の画像がモザイク対象の場合は、その画像を選択状態にする
      if (selectedImageId !== mosaicImages[0].id) {
        setSelectedImageId(mosaicImages[0].id);
        // 選択を変更した後、少し待ってからモザイクエディタを開く
        setTimeout(() => {
          // 選択変更後に直接モザイクエディタを開く
          const img = mosaicImages[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const base64 = e.target?.result as string;
              const base64Data = base64.split(',')[1];
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
          reader.readAsDataURL(img.file);
        }, 100);
        return;
      }
      
      // 既に選択中の画像がモザイク対象の場合は、直接処理する
      const img = mosaicImages[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const base64 = e.target?.result as string;
          const base64Data = base64.split(',')[1];
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
          console.error('Error sending image to mosaic editor:', error);
          alert('モザイクエディタへの送信中にエラーが発生しました。');
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file as data URL');
        alert('ファイルの読み込み中にエラーが発生しました。');
      };
      
      reader.readAsDataURL(img.file);
      return;
    }
    
    // 複数画像の場合は、ユーザーに個別に選択するよう促す
    alert('複数の画像をモザイクエディタに送信するには、各画像を個別に選択してプレビューから「モザイクエディタで開く」ボタンをクリックしてください。');
  }, [images, selectedImageId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      
      <div 
        className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8"
        ref={dropAreaRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">ImageSelector</h1>
            <p className="text-gray-600">画像を選択、プレビュー、モザイク対象としてマークし、選択した画像をダウンロードできます。</p>
          </header>
          
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              画像をアップロード
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              className="hidden"
            />
          
            <button
              onClick={handleDownloadNonSelected}
              disabled={images.length === 0}
              className={`py-2 px-4 rounded-md flex items-center ${
                images.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              選択していない画像をダウンロード
            </button>
            
            <button
              onClick={handleDownloadSelected}
              disabled={mosaicCount === 0}
              className={`py-2 px-4 rounded-md flex items-center ${
                mosaicCount === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              モザイク対象の画像をダウンロード ({mosaicCount})
            </button>
            
            <button
              onClick={handleDownloadNonSelected}
              disabled={images.length === 0 || mosaicCount === images.length}
              className={`py-2 px-4 rounded-md flex items-center ${
                images.length === 0 || mosaicCount === images.length
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              モザイク対象でない画像をダウンロード ({images.length - mosaicCount})
            </button>
            
            <button
              onClick={handleDownloadAll}
              disabled={images.length === 0}
              className={`py-2 px-4 rounded-md flex items-center ${
                images.length === 0 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              すべての画像をダウンロード ({images.length})
            </button>
          
            <button
              onClick={handleSendToMosaicEditor}
              disabled={!images.some(img => img.isMarkedForMosaic)}
              className={`py-2 px-4 rounded-md flex items-center ${
                !images.some(img => img.isMarkedForMosaic) 
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              モザイクエディタへ送信
            </button>
          </div>
        
          {images.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              {images.length} 個の画像 ({mosaicCount} 個がモザイク対象)
            </div>
          )}
        
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5 h-[calc(100vh-240px)]">
              <div className="md:col-span-2 border-r p-4 overflow-y-auto" style={{ height: '100%' }}>
                <ImageList
                  images={images}
                  selectedImageId={selectedImageId}
                  onSelectImage={setSelectedImageId}
                  onToggleMosaic={handleToggleMosaic}
                  onDeleteImage={handleDeleteImage}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                />
              </div>
              <div className="md:col-span-3 p-4 overflow-hidden" style={{ height: '100%' }}>
                <ImagePreview selectedImage={selectedImage} />
              </div>
            </div>
          </div>
        
          <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>画像はブラウザ内で処理され、サーバーにアップロードされません。</p>
            <p className="mt-1">最大 {MAX_FILES} ファイル、1ファイルあたり最大 {MAX_FILE_SIZE_MB}MB まで対応</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;
