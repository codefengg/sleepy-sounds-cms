import { callFunction } from './cloudApi';

// 获取音频列表
export const fetchAudios = async (params) => {
  try {
    const response = await callFunction('getAudios', params);
    return response;
  } catch (error) {
    console.error('获取音频列表失败:', error);
    throw error;
  }
};

// 获取单个音频详情
export const getAudioById = async (id) => {
  try {
    const response = await callFunction('getAudioById', { id });
    return response;
  } catch (error) {
    console.error('获取音频详情失败:', error);
    throw error;
  }
};

// 保存音频信息（新增或更新）
export const saveAudio = async (audioData) => {
  try {
    const response = await callFunction('saveAudio', audioData);
    return response;
  } catch (error) {
    console.error('保存音频失败:', error);
    throw error;
  }
};

// 删除音频
export const removeAudio = async (id) => {
  try {
    const response = await callFunction('removeAudio', { id });
    return response;
  } catch (error) {
    console.error('删除音频失败:', error);
    throw error;
  }
}; 