import { callFunction } from './cloudApi';

/**
 * 获取音乐列表
 * @param {Object} params - 请求参数
 * @param {string} [params.categoryId] - 分类ID
 * @returns {Promise<Object>} 包含音乐数据的响应
 */
export const getMusic = async (params = {}) => {
  return await callFunction('musicManager', {
    action: 'get',
    ...params
  });
};

/**
 * 获取所有音乐
 * @returns {Promise<Object>} 包含所有音乐数据的响应
 */
export const getAllMusic = async () => {
  return await callFunction('musicManager', {
    action: 'getAll'
  });
};

/**
 * 根据ID获取音乐
 * @param {string} id - 音乐ID
 * @returns {Promise<Object>} 包含音乐数据的响应
 */
export const getMusicById = async (id) => {
  return await callFunction('musicManager', {
    action: 'getById',
    id
  });
};

/**
 * 添加音乐
 * @param {Object} data - 音乐数据
 * @returns {Promise<Object>} 包含添加结果的响应
 */
export const addMusic = async (data) => {
  return await callFunction('musicManager', {
    action: 'add',
    ...data
  });
};

/**
 * 更新音乐
 * @param {string} id - 音乐ID
 * @param {Object} data - 要更新的数据
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const updateMusic = async (id, data) => {
  return await callFunction('musicManager', {
    action: 'update',
    id,
    ...data
  });
};

/**
 * 删除音乐
 * @param {string} id - 要删除的音乐ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteMusic = async (id) => {
  return await callFunction('musicManager', {
    action: 'delete',
    id
  });
};

/**
 * 批量更新音乐排序
 * @param {Object} data - 排序数据
 * @param {Array} data.items - 包含id和order的对象数组
 * @param {string} data.orderType - 排序类型 ('globalOrder' 或 'categoryOrder')
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const batchUpdateMusicOrder = async (data) => {
  return await callFunction('musicManager', {
    action: 'batchUpdateOrder',
    ...data
  });
};

/**
 * 更新单个音乐排序
 * @param {string} id - 音乐ID
 * @param {string} orderType - 排序类型 ('globalOrder' 或 'categoryOrder')
 * @param {number} order - 排序值
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const updateMusicOrder = async (id, orderType, order) => {
  return await callFunction('musicManager', {
    action: 'updateOrder',
    id,
    orderType,
    order
  });
};

/**
 * 重新排序分类内音乐
 * @param {string} categoryId - 分类ID
 * @returns {Promise<Object>} 包含重排序结果的响应
 */
export const reorderCategoryMusic = async (categoryId) => {
  return await callFunction('musicManager', {
    action: 'reorderCategory',
    categoryId
  });
};

/**
 * 初始化所有音乐排序值
 * @returns {Promise<Object>} 包含初始化结果的响应
 */
export const initializeOrderValues = async () => {
  return await callFunction('musicManager', {
    action: 'initializeOrders'
  });
}; 