import JSZip from 'jszip';
import { ImageInfo } from '../types';

/**
 * Creates a zip file containing the specified images and triggers download
 * @param images Array of image information objects to download
 * @param zipName Optional name for the zip file (without extension)
 * @returns Promise that resolves when download is complete
 */
export const downloadImagesAsZip = async (images: ImageInfo[], zipName?: string): Promise<void> => {
  try {
    const zip = new JSZip();
    
    if (images.length === 0) {
      alert('ダウンロードできる画像がありません。');
      return;
    }
    
    // Add each image to the zip file
    for (const image of images) {
      // Get the file data directly from the File object
      const fileData = await image.file.arrayBuffer();
      zip.file(image.name, fileData);
    }
    
    // Generate the zip file as a blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Create a download link and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    const defaultName = zipName || 'selected-images';
    downloadLink.download = `${defaultName}-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the object URL
    URL.revokeObjectURL(downloadLink.href);
  } catch (error) {
    console.error('Error creating zip file:', error);
    alert('Failed to create zip file. Please try again.');
  }
};
