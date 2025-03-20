import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { callFunction } from '../../api/cloudApi';

// 模拟数据
const mockHomepageConfig = {
  title: '轻松入眠',
  subtitle: '每天晚上都能安然入睡',
  recommendedAudios: [
    {
      _id: '1',
      title: '轻松冥想音乐',
      subtitle: '帮助您放松心情的冥想音乐',
      listImage: 'https://via.placeholder.com/150',
      mainTab: '助眠',
      subTab: '音乐'
    },
    {
      _id: '3',
      title: '深呼吸练习',
      subtitle: '专业呼吸练习指导',
      listImage: 'https://via.placeholder.com/150',
      mainTab: '呼吸',
      subTab: '练习'
    }
  ]
};

// 获取首页配置
export const fetchHomepageConfig = createAsyncThunk(
  'homepage/fetchHomepageConfig',
  async () => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockHomepageConfig);
      }, 500);
    });
  }
);

// 更新首页配置
export const updateHomepageConfig = createAsyncThunk(
  'homepage/updateHomepageConfig',
  async (configData) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(configData);
      }, 500);
    });
  }
);

const homepageSlice = createSlice({
  name: 'homepage',
  initialState: {
    config: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 获取首页配置
      .addCase(fetchHomepageConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomepageConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchHomepageConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 更新首页配置
      .addCase(updateHomepageConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateHomepageConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(updateHomepageConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default homepageSlice.reducer; 