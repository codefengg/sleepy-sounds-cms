import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import categoryReducer from './slices/categorySlice';
import homepageReducer from './slices/homepageSlice';
import statisticsReducer from './slices/statisticsSlice';

const store = configureStore({
  reducer: {
    audio: audioReducer,
    category: categoryReducer,
    homepage: homepageReducer,
    statistics: statisticsReducer
  }
});

export default store; 