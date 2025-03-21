import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import store from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
import { initCloud } from './api/cloudApi';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  PictureOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import CategoryManagement from './pages/CategoryManagement';
import ImageLibrary from './pages/ImageLibrary';
import MusicManagement from './pages/MusicManagement';

// 布局
import MainLayout from './layouts/MainLayout';

import './styles/app.scss';

const { Header, Sider, Content } = Layout;

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
            <Layout className="app-container">
              <Header className="app-header">
                <div className="logo">音频内容管理系统</div>
              </Header>
              <Layout>
                <Sider width={200} className="app-sider">
                  <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ height: '100%', borderRight: 0 }}
                  >
                    <Menu.Item key="1" icon={<HomeOutlined />}>
                      <Link to="/">首页</Link>
                    </Menu.Item>
                    <Menu.Item key="2" icon={<AppstoreOutlined />}>
                      <Link to="/categories">分类管理</Link>
                    </Menu.Item>
                    <Menu.Item key="3" icon={<PictureOutlined />}>
                      <Link to="/images">图片库</Link>
                    </Menu.Item>
                    <Menu.Item key="4" icon={<CustomerServiceOutlined />}>
                      <Link to="/music">音乐管理</Link>
                    </Menu.Item>
                  </Menu>
                </Sider>
                <Layout style={{ padding: '0 24px 24px' }}>
                  <Content className="app-content">
                    <Routes>
                      <Route path="/" element={<Navigate to="/categories" replace />} />
                      <Route path="/categories" element={<CategoryManagement />} />
                      <Route path="/images" element={<ImageLibrary />} />
                      <Route path="/music" element={<MusicManagement />} />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
          </BrowserRouter>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App; 