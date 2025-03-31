import { callFunction, getCloudInstance } from './cloudApi';
import cloudConfig from '../config/cloudConfig';

/**
 * 获取图片列表
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=20] - 每页数量
 * @param {number} [params.skip=0] - 跳过数量
 * @returns {Promise<Object>} 包含图片数据的响应
 */
export const getImages = async (params = {}) => {
  return await callFunction('imageLibrary', { 
    action: 'getImages',
    data: params
  });
};

/**
 * 添加图片
 * @param {Object} imageData - 图片数据
 * @param {string} imageData.name - 图片名称
 * @param {string} imageData.largeUrl - 大图URL
 * @param {string} imageData.thumbnailUrl - 缩略图URL
 * @param {string} imageData.playUrl - 播放图URL
 * @param {string} [imageData.videoUrl] - 视频URL（可选）
 * @param {string} [imageData.animatedUrl] - 动画图URL（可选）
 * @returns {Promise<Object>} 包含添加结果的响应
 */
export const addImage = async (imageData) => {
  return await callFunction('imageLibrary', { 
    action: 'addImage',
    data: imageData
  });
};

/**
 * 更新图片
 * @param {Object} imageData - 图片数据
 * @param {string} imageData._id - 图片ID
 * @param {string} [imageData.largeUrl] - 大图URL
 * @param {string} [imageData.thumbnailUrl] - 缩略图URL
 * @param {string} [imageData.playUrl] - 播放图URL
 * @param {string} [imageData.videoUrl] - 视频URL
 * @param {string} [imageData.animatedUrl] - 动画图URL
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const updateImage = async (imageData) => {
  return await callFunction('imageLibrary', { 
    action: 'updateImage',
    data: imageData
  });
};

/**
 * 删除图片
 * @param {string} id - 要删除的图片ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteImage = async (id) => {
  return await callFunction('imageLibrary', { 
    action: 'deleteImage',
    data: { _id: id }
  });
};

/**
 * 上传图片到云存储
 * @param {File} file - 要上传的文件
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