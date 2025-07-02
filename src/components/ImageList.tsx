import React from 'react';
import { ImageListProps } from '../types';

interface ExtendedProps extends ImageListProps {
  columns?: number; // 指定があれば固定列
}

const ImageList: React.FC<ExtendedProps> = ({ 
  images, 
  selectedImageId, 
  onSelectImage, 
  onToggleMosaic, 
  onDeleteImage,
  horizontal = false,
  columns,
}) => {
  return (
    <div className="h-full w-full">
      {/* Header hidden in horizontal mode */}
      {!horizontal && (
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">画像リスト</h2>
        {images.length > 0 && (
          <div
            className={`py-1 px-3 text-sm rounded cursor-pointer select-none ${images.length > 0 && images.every(img => img.isMarkedForMosaic) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              console.log('すべて採用がクリックされました');
              // すべての画像のモザイク状態を切り替える
              const allMarked = images.every(img => img.isMarkedForMosaic);
              images.forEach(img => {
                // すべてチェックされている場合はすべて外す、そうでない場合はすべてチェックする
                if (!allMarked) {
                  onToggleMosaic(img.id);
                } else if (!img.isMarkedForMosaic) {
                  onToggleMosaic(img.id);
                }
              });
            }}
          >
            {images.length > 0 && images.every(img => img.isMarkedForMosaic) ? '✓ ' : ''}すべて採用
          </div>
        )}
      </div>
      )}
      <div className={`image-list-container ${horizontal ? 'overflow-x-auto' : 'overflow-y-auto'} flex-1 pr-2`}>
        {images.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            画像がありません。<br />
            画像をドラッグ＆ドロップするか、<br />
            「画像をアップロード」ボタンをクリックしてください。
          </div>
        ) : (
          <div className={horizontal ? 'flex flex-row gap-3 flex-nowrap' : (columns === 3 ? 'grid grid-cols-3 gap-2' : columns === 1 ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4')}>
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`
                  ${horizontal ? 'w-48' : '' /* no extra width in grid mode */}
                  relative border rounded-lg overflow-hidden cursor-pointer
                  ${selectedImageId === image.id ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={(e) => {
                  // チェックボックスやラベルのクリックイベントと競合しないようにする
                  const target = e.target as HTMLElement;
                  if (target.tagName !== 'INPUT' && target.tagName !== 'LABEL') {
                    onSelectImage(image.id);
                  }
                }}
              >
                <img 
                  src={image.url} 
                  alt={image.name}
                  className={horizontal ? 'h-32 w-48 object-cover' : (columns ? 'w-full h-28 object-contain' : 'w-full h-40 object-cover')}
                />
                <div className="absolute top-1 right-1 flex space-x-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteImage(image.id);
                    }}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                    title="削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs truncate" title={image.name}>{image.name}</p>
                  <div className="mt-1">
                    <div 
                      className={`w-full py-1 px-2 text-xs text-center rounded cursor-pointer select-none ${image.isMarkedForMosaic ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('モザイクボタンがクリックされました', image.id);
                        // モザイク切り替え関数のみ呼び出す
                        onToggleMosaic(image.id);
                      }}
                    >
                      {image.isMarkedForMosaic ? '✓ ' : ''}採用
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageList;
