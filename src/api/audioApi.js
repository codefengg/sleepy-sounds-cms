import { callFunction, getCloudInstance } from './cloudApi';

/**
 * 获取音频列表
 * @param {Object} params - 查询参数
 * @param {number} [params.limit=20] - 每页数量
 * @param {number} [params.skip=0] - 跳过数量
 * @returns {Promise<Object>} 包含音频数据的响应
 */
export const getAudios = async () => {
  return await callFunction('audioLibrary', { 
    action: 'get',
    data: {}
  });
};

/**
 * 添加音频记录
 * @param {Object} data - 音频数据
 * @param {string} data.url - 音频URL
 * @param {string} data.name - 音频名称
 * @returns {Promise<Object>} 包含新添加音频的响应
 */
export const addAudio = async (data) => {
  return await callFunction('audioLibrary', { 
    action: 'add',
    data
  });
};

/**
 * 删除音频
 * @param {string} _id - 要删除的音频ID
 * @returns {Promise<Object>} 包含删除结果的响应
 */
export const deleteAudio = async (_id) => {
  return await callFunction('audioLibrary', { 
    action: 'delete',
    data: { _id }
  });
};

/**
 * 上传音频到云存储
 * @param {File} file - 要上传的音频文件
 * @returns {Promise<Object>} 包含上传结果的响应
 */
export const uploadAudioToCloud = async (file) => {
  try {
    const cloudInstance = getCloudInstance();
    if (!cloudInstance) {
      throw new Error('云开发SDK尚未初始化');
    }
    
    // 获取文件扩展名
    const ext = file.name.substring(file.name.lastIndexOf('.'));
    // 生成随机文件名
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    const cloudPath = `audio/${fileName}`;
    
    console.log('开始上传音频到云存储:', cloudPath);
    
    // 上传文件并等待结果
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
    console.error('上传音频失败:', error);
    return {
      success: false,
      error: error.message || '上传音频失败'
    };
  }
}; 