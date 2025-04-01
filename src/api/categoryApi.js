import { callFunction, getCloudInstance } from './cloudApi';

/**
 * 获取分类列表
 * @returns {Promise<Object>} 包含分类数据的响应
 */
export const getCategories = async () => {
  return await callFunction('categoryManager', { action: 'get' });
};

/**
 * 添加分类
 * @param {Object} categoryData - 分类数据
 * @param {string} categoryData.name - 分类名称
 * @param {string} [categoryData.parentId] - 父分类ID（可选，不提供则为一级分类）
 * @param {number} [categoryData.order] - 排序序号（可选）
 * @param {string} [categoryData.iconUrl] - 分类图标URL（可选，仅一级分类可用）
 * @returns {Promise<Object>} 包含新创建分类的响应
 */
export const addCategory = async (categoryData) => {
  return await callFunction('categoryManager', { 
    action: 'add',
    ...categoryData
  });
};

/**
 * 更新分类
 * @param {Object} categoryData - 分类数据
 * @param {string} categoryData.id - 分类ID
 * @param {string} [categoryData.name] - 分类名称（可选）
 * @param {string} [categoryData.parentId] - 父分类ID（可选）
 * @param {number} [categoryData.order] - 排序序号（可选）
 * @param {string} [categoryData.iconUrl] - 分类图标URL（可选，仅一级分类可用）
 * @returns {Promise<Object>} 包含更新后分类的响应
 */
export const updateCategory = async (categoryData) => {
  return await callFunction('categoryManager', { 
    action: 'update',
    ...categoryData
  });
};

/**
 * 删除分类
 * @param {string} id - 要删除的分类ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteCategory = async (id) => {
  return await callFunction('categoryManager', { 
    action: 'delete',
    id
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
    const cloudPath = `images/${fileName}`;
    
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