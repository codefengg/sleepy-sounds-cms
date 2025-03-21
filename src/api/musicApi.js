import { callFunction } from './cloudApi';

/**
 * 获取音乐列表
 * @param {Object} params - 查询参数
 * @param {string} [params.categoryId] - 分类ID（可选）
 * @param {number} [params.limit=20] - 每页数量
 * @param {number} [params.skip=0] - 跳过数量
 * @returns {Promise<Object>} 包含音乐数据的响应
 */
export const getMusic = async (params = {}) => {
  return await callFunction('musicManager', { 
    action: 'get',
    ...params
  });
};

/**
 * 添加音乐
 * @param {Object} musicData - 音乐数据
 * @param {string} musicData.audioUrl - 音乐链接
 * @param {string} musicData.name - 音乐名称
 * @param {string} musicData.title - 标题
 * @param {string} [musicData.backgroundUrl] - 音乐背景图
 * @param {string} [musicData.iconUrl] - 音乐播放图标
 * @param {string} [musicData.listImageUrl] - 音乐列表图
 * @param {string} [musicData.subtitle] - 副标题
 * @param {string} musicData.categoryId - 分类ID
 * @returns {Promise<Object>} 包含新添加音乐的响应
 */
export const addMusic = async (musicData) => {
  return await callFunction('musicManager', { 
    action: 'add',
    ...musicData
  });
};

/**
 * 更新音乐
 * @param {string} id - 要更新的音乐ID
 * @param {Object} musicData - 更新的音乐数据
 * @returns {Promise<Object>} 包含更新结果的响应
 */
export const updateMusic = async (id, musicData) => {
  return await callFunction('musicManager', { 
    action: 'update',
    id,
    ...musicData
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