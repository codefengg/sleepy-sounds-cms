import { uploadFile as cloudUploadFile } from './cloudApi';

// 上传文件
export const uploadFile = async (formData) => {
  try {
    const file = formData.get('file');
    const fileName = file.name;
    const fileType = fileName.split('.').pop().toLowerCase();
    const isAudio = file.type.startsWith('audio');
    
    // 根据文件类型生成路径
    const path = isAudio 
      ? `audios/${Date.now()}.${fileType}` 
      : `images/${Date.now()}.${fileType}`;
    
    const result = await cloudUploadFile(file, path);
    return result;
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
}; 