import { callFunction } from './cloudApi';

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