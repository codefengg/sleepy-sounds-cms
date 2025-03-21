import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCategories as apiGetCategories, addCategory as apiAddCategory, updateCategory as apiUpdateCategory, deleteCategory as apiDeleteCategory } from '../../api/categoryApi';

// 模拟数据 - 包含一级和二级分类
const mockCategories = [
  // 一级分类
  { _id: '1', name: '助眠音乐', order: 1 },
  { _id: '2', name: '冥想引导', order: 2 },
  { _id: '3', name: '自然声音', order: 3 },
  { _id: '4', name: '睡前故事', order: 4 },
  
  // 二级分类
  { _id: '101', name: '轻音乐', parentId: '1', order: 1 },
  { _id: '102', name: '白噪音', parentId: '1', order: 2 },
  { _id: '103', name: '古典音乐', parentId: '1', order: 3 },
  { _id: '104', name: '深度冥想', parentId: '2', order: 1 },
  { _id: '105', name: '放松冥想', parentId: '2', order: 2 },
  { _id: '106', name: '雨声', parentId: '3', order: 1 },
  { _id: '107', name: '海浪声', parentId: '3', order: 2 },
  { _id: '108', name: '森林声', parentId: '3', order: 3 },
  { _id: '109', name: '儿童故事', parentId: '4', order: 1 },
  { _id: '110', name: '成人故事', parentId: '4', order: 2 }
];

// 获取分类列表
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async () => {
    const result = await apiGetCategories();
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || '获取分类列表失败');
    }
  }
);

// 添加分类
export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (categoryData) => {
    const result = await apiAddCategory(categoryData);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || '添加分类失败');
    }
  }
);

// 更新分类
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async (categoryData) => {
    // 确保使用id而不是_id
    const { _id, ...rest } = categoryData;
    const result = await apiUpdateCategory({ id: _id, ...rest });
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || '更新分类失败');
    }
  }
);

// 删除分类
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id) => {
    const result = await apiDeleteCategory(id);
    if (result.success) {
      return result.deletedId;
    } else {
      throw new Error(result.error || '删除分类失败');
    }
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
        // 删除指定分类
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload
        );
        
        // 同时删除其所有子分类
        state.categories = state.categories.filter(
          (category) => category.parentId !== action.payload
        );
      });
  }
});

export default categorySlice.reducer; 