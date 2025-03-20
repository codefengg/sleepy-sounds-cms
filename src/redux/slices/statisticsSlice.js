import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { callFunction } from '../../api/cloudApi';

// 模拟数据
const mockStatistics = {
  totalAudios: 15,
  totalPlays: 2500,
  totalCategories: 8,
  recommendedAudios: 5
};

// 获取统计数据
export const fetchStatistics = createAsyncThunk(
  'statistics/fetchStatistics',
  async (params) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockStatistics);
      }, 500);
    });
  }
);

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatistics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default statisticsSlice.reducer; 