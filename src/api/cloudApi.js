import cloudConfig from '../config/cloudConfig';

// 云实例
let cloudInstance = null;
// 初始化状态
let isInitializing = false;
let initPromise = null;

/**
 * 初始化云开发SDK
 * @returns {Promise<boolean>} 初始化是否成功
 */
export const initCloud = async () => {
  // 如果已经初始化，直接返回成功
  if (cloudInstance) {
    return true;
  }
  
  // 如果正在初始化，返回初始化Promise
  if (isInitializing && initPromise) {
    return initPromise;
  }
  
  // 开始初始化
  isInitializing = true;
  initPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('开始初始化云开发SDK...');
      // 声明新的 cloud 实例
      const c1 = new cloud.Cloud({
        // 必填，表示是未登录模式
        identityless: true,
        // 资源方 AppID
        resourceAppid: cloudConfig.resourceAppid,
        // 资源方环境 ID
        resourceEnv: cloudConfig.resourceEnv,
      });

      // 跨账号调用，必须等待 init 完成
      await c1.init();
      
      // 保存实例
      cloudInstance = c1;
      console.log('云开发SDK初始化成功');
      resolve(true);
    } catch (error) {
      console.error('云开发SDK初始化失败:', error);
      isInitializing = false;
      initPromise = null;
      reject(error);
    }
  });
  
  return initPromise;
};

/**
 * 确保SDK已初始化
 * @returns {Promise<void>}
 */
const ensureInitialized = async () => {
  if (!cloudInstance) {
    console.log('SDK尚未初始化，正在初始化...');
    await initCloud();
  }
};

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 传递给云函数的数据
 * @returns {Promise<any>} - 云函数返回的结果
 */
export const callFunction = async (name, data = {}) => {
  // 确保SDK已初始化
  await ensureInitialized();
  
  if (!cloudInstance) {
    throw new Error('云开发SDK初始化失败，无法调用云函数');
  }

  console.log(`${name}：参数:`, data);
  
  return new Promise((resolve, reject) => {
    cloudInstance.callFunction({
      name,
      data,
      success: (res) => {
        console.log(`${name}：返回结果:`, res.result);
        resolve(res.result);
      },
      fail: (err) => {
        console.error(`${name}：错误:`, err.message);
        reject(err);
      },
    });
  });
}; 