import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  PictureOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import '../styles/layout.scss';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
  const location = useLocation();
  
  // 菜单项
  const menuItems = [
    {
      key: '/',
      icon: <AppstoreOutlined />,
      label: <Link to="/">分类管理</Link>,
    },
    {
      key: '/images',
      icon: <PictureOutlined />,
      label: <Link to="/images">图片库</Link>,
    },
    {
      key: '/titles',
      icon: <ClockCircleOutlined />,
      label: <Link to="/titles">标题管理</Link>,
    }
  ];
  
  // 获取当前选中的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['/'];
    if (path.startsWith('/images')) return ['/images'];
    return ['/'];
  };

  return (
    <Layout className="main-layout">
      <Header className="header">
        <div className="logo">音频内容管理系统</div>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKey()}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 