import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { callFunction } from '../../api/cloudApi';

// 模拟数据
const mockCategories = [
  { _id: '1', name: '音乐', mainTab: '助眠', order: 1 },
  { _id: '2', name: '自然声', mainTab: '助眠', order: 2 },
  { _id: '3', name: '冥想', mainTab: '助眠', order: 3 },
  { _id: '4', name: '练习', mainTab: '呼吸', order: 1 },
  { _id: '5', name: '指导', mainTab: '呼吸', order: 2 }
];

// 获取分类列表
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCategories);
      }, 500);
    });
  }
);

// 添加分类
export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (categoryData) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCategory = {
          ...categoryData,
          _id: Date.now().toString()
        };
        resolve(newCategory);
      }, 500);
    });
  }
);

// 更新分类
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async (categoryData) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(categoryData);
      }, 500);
    });
  }
);

// 删除分类
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(id);
      }, 500);
    });
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 获取分类列表
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 添加分类
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // 更新分类
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (category) => category._id === action.payload._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      // 删除分类
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
      });
  }
});

export default categorySlice.reducer; 