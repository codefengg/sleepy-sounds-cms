import axios from 'axios';

// 微信云开发环境ID
const ENV = 'your-cloud-env-id';
// 微信云开发HTTP API地址
const BASE_URL = 'https://api.weixin.qq.com/tcb';
// 从环境变量获取访问令牌
const ACCESS_TOKEN = process.env.REACT_APP_WX_ACCESS_TOKEN;

// 创建axios实例
const cloudApi = axios.create({
  baseURL: BASE_URL,
  params: {
    access_token: ACCESS_TOKEN,
    env: ENV
  }
});

// 调用云函数
export const callFunction = async (name, data = {}) => {
  try {
    const response = await cloudApi.post('/invokecloudfunction', null, {
      params: {
        name,
      },
      data: JSON.stringify(data)
    });
    return JSON.parse(response.data.resp_data);
  } catch (error) {
    console.error('调用云函数失败:', error);
    throw error;
  }
};

// 上传文件到云存储
export const uploadFile = async (file, path) => {
  try {
    // 第一步：获取上传链接
    const uploadUrlRes = await cloudApi.post('/uploadfile', {
      path
    });
    
    // 第二步：上传文件
    const formData = new FormData();
    formData.append('key', path);
    formData.append('Signature', uploadUrlRes.data.authorization);
    formData.append('x-cos-security-token', uploadUrlRes.data.token);
    formData.append('x-cos-meta-fileid', uploadUrlRes.data.cos_file_id);
    formData.append('file', file);
    
    await axios.post(uploadUrlRes.data.url, formData);
    
    // 第三步：获取文件下载链接
    const fileUrl = await getFileUrl(uploadUrlRes.data.file_id);
    
    return {
      fileId: uploadUrlRes.data.file_id,
      fileUrl
    };
  } catch (error) {
    console.error('上传文件失败:', error);
    throw error;
  }
};

// 获取文件下载链接
export const getFileUrl = async (fileId) => {
  try {
    const response = await cloudApi.post('/batchdownloadfile', {
      file_list: [{ fileid: fileId, max_age: 7200 }]
    });
    
    if (response.data.file_list && response.data.file_list.length > 0) {
      return response.data.file_list[0].download_url;
    }
    throw new Error('无法获取文件下载链接');
  } catch (error) {
    console.error('获取文件下载链接失败:', error);
    throw error;
  }
};

export default cloudApi; 