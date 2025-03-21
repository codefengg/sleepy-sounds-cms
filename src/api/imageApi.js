import { callFunction, getCloudInstance } from './cloudApi';
import cloudConfig from '../config/cloudConfig';

/**
 * 获取图片列表
 * @param {Object} params - 查询参数
 * @param {string} [params.type] - 图片类型（可选）
 * @param {number} [params.limit=20] - 每页数量
 * @param {number} [params.skip=0] - 跳过数量
 * @returns {Promise<Object>} 包含图片数据的响应
 */
export const getImages = async (params = {}) => {
  return await callFunction('imageLibrary', { 
    action: 'get',
    ...params
  });
};

/**
 * 添加图片
 * @param {Object} imageData - 图片数据
 * @param {string} imageData.url - 图片URL
 * @param {string} imageData.name - 图片名称
 * @param {string} [imageData.type] - 图片类型（可选）
 * @param {number} [imageData.size] - 图片大小（可选）
 * @param {string} [imageData.description] - 图片描述（可选）
 * @returns {Promise<Object>} 包含新添加图片的响应
 */
export const addImage = async (imageData) => {
  return await callFunction('imageLibrary', { 
    action: 'add',
    ...imageData
  });
};

/**
 * 删除图片
 * @param {string} id - 要删除的图片ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteImage = async (id) => {
  return await callFunction('imageLibrary', { 
    action: 'delete',
    id
  });
};

/**
 * 上传图片到云存储
 * @param {File} file - 要上传的文件对象
 * @returns {Promise<Object>} 包含上传结果的响应
 */
export const uploadImageToCloud = async (file) => {
  try {
    const cloudInstance = getCloudInstance();
    if (!cloudInstance) {
      throw new Error('云开发SDK尚未初始化');
    }
    
    // 获取文件扩展名
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    // 生成随机文件名
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    const cloudPath = `library/${fileName}`;
    
    console.log('开始上传文件到云存储:', cloudPath);
    
    // 使用Promise风格调用
    cloudInstance.uploadFile({
      cloudPath,
      file,
      config: {
        env: '636c-cloud1-7g7ul2l734c0683b-1349745487'
      }
    });
        
    // 直接拼接URL而不是调用getTempFileURL
    const fileUrl = `https://636c-cloud1-7g7ul2l734c0683b-1349745487.tcb.qcloud.la/${cloudPath}`;
    console.log('拼接的文件访问链接:', fileUrl);
    
    return {
      success: true,
      fileUrl
    };
  } catch (error) {
    console.error('上传文件失败:', error);
    return {
      success: false,
      error: error.message || '上传文件失败'
    };
  }
}; 