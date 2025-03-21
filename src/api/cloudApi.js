import cloudConfig from '../config/cloudConfig';

// 云实例
let cloudInstance = null;

/**
 * 初始化云开发SDK
 * @returns {Promise<void>}
 */
export const initCloud = async () => {
  try {
    // 声明新的 cloud 实例
    cloudInstance = new cloud.Cloud({
      // 必填，表示是未登录模式
      identityless: true,
      // 资源方 AppID
      resourceAppid: cloudConfig.resourceAppid,
      // 资源方环境 ID
      resourceEnv: cloudConfig.resourceEnv,
    });

    // 跨账号调用，必须等待 init 完成
    await cloudInstance.init();
    console.log('云开发SDK初始化成功');
    return true;
  } catch (error) {
    console.error('云开发SDK初始化失败:', error);
    return false;
  }
};

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 传递给云函数的数据
 * @returns {Promise<any>} - 云函数返回的结果
 */
export const callFunction = (name, data = {}) => {
  if (!cloudInstance) {
    throw new Error('云开发SDK尚未初始化，请先调用initCloud()');
  }

  return new Promise((resolve, reject) => {
    cloudInstance.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}; 