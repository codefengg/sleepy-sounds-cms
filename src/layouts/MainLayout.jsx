import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined
} from '@ant-design/icons';
import '../styles/layout.scss';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: '分类管理',
      onClick: () => navigate('/')
    }
    // 在这里添加新的菜单项
  ];

  return (
    <Layout className="main-layout">
      <Sider width={200} className="site-layout-background">
        <div className="logo">音频CMS</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['categories']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="site-layout-header">
          <h1>音频内容管理系统</h1>
        </Header>
        <Content className="site-layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 