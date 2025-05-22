// src/lib/storage.ts
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// File upload options
interface UploadOptions {
  bucketName?: string;
  folderPath?: string;
  fileNamePrefix?: string;
  contentType?: string;
  isPublic?: boolean;
}

// Default upload options
const defaultOptions: UploadOptions = {
  bucketName: 'teke-teke-public',
  folderPath: '', // Root folder
  fileNamePrefix: '',
  contentType: '',
  isPublic: true,
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (file: File, options?: UploadOptions) => {
  try {
    const {
      bucketName,
      folderPath,
      fileNamePrefix,
      contentType,
      isPublic,
    } = { ...defaultOptions, ...options };

    // Generate a unique file name to avoid collisions
    const fileExtension = file.name.split('.').pop();
    const uniqueId = uuidv4();
    const fileName = fileNamePrefix 
      ? `${fileNamePrefix}-${uniqueId}.${fileExtension}`
      : `${uniqueId}.${fileExtension}`;

    // Construct the file path
    const filePath = folderPath 
      ? `${folderPath}/${fileName}`
      : fileName;

    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName!)
      .upload(filePath, file, {
        contentType: contentType || file.type,
        upsert: true, // Overwrite if exists
        cacheControl: isPublic ? '3600' : '0', // Cache for 1 hour if public
      });

    if (error) {
      throw error;
    }

    // Get the public URL if isPublic is true
    if (isPublic) {
      const { data: urlData } = supabase.storage
        .from(bucketName!)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        url: urlData.publicUrl,
      };
    }

    return {
      path: data.path,
      url: null,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (path: string, bucketName: string = defaultOptions.bucketName!) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Custom hook for handling file uploads
 */
export const useFileUpload = () => {
  const uploadLogo = async (file: File) => {
    return uploadFile(file, {
      bucketName: 'teke-teke-public',
      folderPath: 'logos',
      fileNamePrefix: 'shop-logo',
      isPublic: true,
    });
  };

  const uploadAvatar = async (file: File) => {
    return uploadFile(file, {
      bucketName: 'teke-teke-public',
      folderPath: 'avatars',
      fileNamePrefix: 'user-avatar',
      isPublic: true,
    });
  };

  const uploadDocument = async (file: File) => {
    return uploadFile(file, {
      bucketName: 'teke-teke-private',
      folderPath: 'documents',
      fileNamePrefix: 'document',
      isPublic: false,
    });
  };

  return {
    uploadFile,
    deleteFile,
    uploadLogo,
    uploadAvatar,
    uploadDocument,
  };
};