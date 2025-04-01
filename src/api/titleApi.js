import { callFunction } from './cloudApi';

/**
 * 获取所有时间段标题
 * @returns {Promise<Object>} 包含标题数据的响应
 */
export const getAllTimeTitles = async () => {
  return await callFunction('titleManager', { 
    action: 'getAll'
  });
};

/**
 * 添加时间段标题
 * @param {Object} data - 标题数据
 * @param {string} data.startTime - 开始时间 (HH:mm)
 * @param {string} data.endTime - 结束时间 (HH:mm)
 * @param {string} data.title - 标题
 * @param {string} [data.subtitle] - 副标题 (可选)
 * @returns {Promise<Object>} 包含添加结果的响应
 */
export const addTimeTitle = async (data) => {
  return await callFunction('titleManager', { 
    action: 'add',
    data
  });
};

/**
 * 更新时间段标题
 * @param {Object} data - 标题数据
 * @param {string} data.id - 标题ID
 * @param {string} [data.startTime] - 开始时间 (HH:mm)
 * @param {string} [data.endTime] - 结束时间 (HH:mm)
 * @param {string} [data.title] - 标题
 * @param {string} [data.subtitle] - 副标题
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const updateTimeTitle = async (data) => {
  return await callFunction('titleManager', { 
    action: 'update',
    data
  });
};

/**
 * 删除时间段标题
 * @param {Object} data - 请求数据
 * @param {string} data.id - 要删除的标题ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteTimeTitle = async (data) => {
  return await callFunction('titleManager', { 
    action: 'delete',
    data
  });
};

/**
 * 获取当前时间对应的标题
 * @returns {Promise<Object>} 包含当前标题的响应
 */
export const getCurrentTitle = async () => {
  return await callFunction('titleManager', { 
    action: 'getCurrentTitle'
  });
}; 