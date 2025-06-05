import React from 'react';
import { ImageListProps } from '../types';

const ImageList: React.FC<ImageListProps> = ({ 
  images, 
  selectedImageId, 
  onSelectImage, 
  onToggleMosaic, 
  onDeleteImage 
}) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">画像リスト</h2>
      <div className="image-list-container flex-1 overflow-y-auto pr-2">
        {images.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            画像がありません。<br />
            画像をドラッグ＆ドロップするか、<br />
            「画像をアップロード」ボタンをクリックしてください。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`
                  relative border rounded-lg overflow-hidden cursor-pointer
                  ${selectedImageId === image.id ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => onSelectImage(image.id)}
              >
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="w-full h-32 object-cover"
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
                  <div className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      id={`mosaic-${image.id}`}
                      checked={image.isMarkedForMosaic}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleMosaic(image.id);
                      }}
                      className="mr-2"
                    />
                    <label 
                      htmlFor={`mosaic-${image.id}`}
                      className="text-xs cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      モザイク
                    </label>
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
