import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import { initCloud } from './api/cloudApi';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
import CategoryManagement from './pages/CategoryManagement';
import ImageLibrary from './pages/ImageLibrary';

import './styles/app.scss';

const App = () => {
  useEffect(() => {
    // 在应用启动时初始化云开发SDK
    const init = async () => {
      try {
        await initCloud();
      } catch (error) {
        console.error('初始化云开发SDK失败:', error);
      }
    };
    
    init();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<CategoryManagement />} />
                <Route path="images" element={<ImageLibrary />} />
                {/* 在这里添加新的路由 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App; 