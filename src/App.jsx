import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';

// 布局
import MainLayout from './layouts/MainLayout';

// 页面
// import Dashboard from './pages/Dashboard'; // 注释或删除这一行
import AudioList from './pages/AudioList';
import AudioEdit from './pages/AudioEdit';
import CategoryManagement from './pages/CategoryManagement';
import HomepageConfig from './pages/HomepageConfig';
import Statistics from './pages/Statistics';

import './styles/app.scss';

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* 将默认路由改为 AudioList 或其他您想要的页面 */}
                <Route index element={<AudioList />} />
                <Route path="audio" element={<AudioList />} />
                <Route path="audio/add" element={<AudioEdit />} />
                <Route path="audio/edit/:id" element={<AudioEdit />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="homepage" element={<HomepageConfig />} />
                <Route path="statistics" element={<Statistics />} />
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