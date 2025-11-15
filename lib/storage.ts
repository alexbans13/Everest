import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

export const uploadProfileImage = async (uri: string, userId: string): Promise<string> => {
  try {
    // Generate unique filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Determine content type
    const contentType = fileExt === 'png' ? 'image/png' : 
                       fileExt === 'gif' ? 'image/gif' : 
                       'image/jpeg';

    // Read file as base64 (React Native compatible)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convert base64 to ArrayBuffer for Supabase
    // Manual base64 decode that works in React Native
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') {
      bufferLength--;
      if (base64[base64.length - 2] === '=') {
        bufferLength--;
      }
    }
    
    const bytes = new Uint8Array(bufferLength);
    let p = 0;
    
    for (let i = 0; i < base64.length; i += 4) {
      const encoded1 = chars.indexOf(base64[i]);
      const encoded2 = chars.indexOf(base64[i + 1]);
      const encoded3 = chars.indexOf(base64[i + 2]);
      const encoded4 = chars.indexOf(base64[i + 3]);
      
      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      if (encoded3 !== 64) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      if (encoded4 !== 64) bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
    
    const byteArray = bytes;

    // Upload to Supabase Storage using ArrayBuffer
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, byteArray, {
        contentType: contentType,
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

