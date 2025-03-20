import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { fetchAudios, removeAudio, saveAudio, getAudioById } from '../../api/audioApi';

// 模拟数据
const mockAudios = {
  data: [
    {
      _id: '1',
      title: '轻松冥想音乐',
      subtitle: '帮助您放松心情的冥想音乐',
      audioUrl: 'https://example.com/audio1.mp3',
      listImage: 'https://via.placeholder.com/150',
      playImage: 'https://via.placeholder.com/300',
      detailImage: 'https://via.placeholder.com/500',
      mainTab: '助眠',
      subTab: '音乐',
      duration: 360,
      playCount: 1250,
      isRecommend: true,
      createTime: '2023-11-01',
      updateTime: '2023-11-05'
    },
    {
      _id: '2',
      title: '自然雨声',
      subtitle: '大自然的雨声助您入眠',
      audioUrl: 'https://example.com/audio2.mp3',
      listImage: 'https://via.placeholder.com/150',
      playImage: 'https://via.placeholder.com/300',
      detailImage: 'https://via.placeholder.com/500',
      mainTab: '助眠',
      subTab: '自然声',
      duration: 480,
      playCount: 980,
      isRecommend: false,
      createTime: '2023-11-02',
      updateTime: '2023-11-06'
    },
    {
      _id: '3',
      title: '深呼吸练习',
      subtitle: '专业呼吸练习指导',
      audioUrl: 'https://example.com/audio3.mp3',
      listImage: 'https://via.placeholder.com/150',
      playImage: 'https://via.placeholder.com/300',
      detailImage: 'https://via.placeholder.com/500',
      mainTab: '呼吸',
      subTab: '练习',
      duration: 240,
      playCount: 650,
      isRecommend: true,
      createTime: '2023-11-03',
      updateTime: '2023-11-07'
    }
  ],
  total: 3
};

// 获取音频列表
export const fetchAudioList = createAsyncThunk(
  'audio/fetchAudioList',
  async (params) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAudios);
      }, 500);
    });
  }
);

// 删除音频
export const deleteAudio = createAsyncThunk(
  'audio/deleteAudio',
  async (id) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(id);
      }, 500);
    });
  }
);

// 获取单个音频详情
export const fetchAudioDetail = createAsyncThunk(
  'audio/fetchAudioDetail',
  async (id) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        const audio = mockAudios.data.find(a => a._id === id);
        resolve(audio || null);
      }, 500);
    });
  }
);

// 保存音频信息（新增或更新）
export const saveAudioInfo = createAsyncThunk(
  'audio/saveAudioInfo',
  async (audioData) => {
    // 模拟API请求
    return new Promise((resolve) => {
      setTimeout(() => {
        if (audioData._id) {
          // 更新
          resolve({...audioData, updateTime: new Date().toISOString()});
        } else {
          // 新增
          resolve({
            ...audioData,
            _id: Date.now().toString(),
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            playCount: 0
          });
        }
      }, 500);
    });
  }
);

const audioSlice = createSlice({
  name: 'audio',
  initialState: {
    audioList: {
      data: [],
      total: 0
    },
    currentAudio: null,
    loading: false,
    error: null
  },
  reducers: {
    resetCurrentAudio: (state) => {
      state.currentAudio = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取音频列表
      .addCase(fetchAudioList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAudioList.fulfilled, (state, action) => {
        state.loading = false;
        state.audioList = action.payload;
      })
      .addCase(fetchAudioList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 删除音频
      .addCase(deleteAudio.fulfilled, (state, action) => {
        state.audioList.data = state.audioList.data.filter(
          (audio) => audio._id !== action.payload
        );
        state.audioList.total -= 1;
      })
      // 获取音频详情
      .addCase(fetchAudioDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAudioDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAudio = action.payload;
      })
      // 保存音频信息
      .addCase(saveAudioInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveAudioInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAudio = action.payload;
      });
  }
});

export const { resetCurrentAudio } = audioSlice.actions;
export default audioSlice.reducer; 