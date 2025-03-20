import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  // DashboardOutlined,
  SoundOutlined,
  TagsOutlined,
  HomeOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import '../styles/layout.scss';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    // 删除或注释掉仪表盘菜单项
    /*{
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/')
    },*/
    {
      key: 'audio',
      icon: <SoundOutlined />,
      label: '音频管理',
      onClick: () => navigate('/audio')
    },
    {
      key: 'categories',
      icon: <TagsOutlined />,
      label: '分类管理',
      onClick: () => navigate('/categories')
    },
    {
      key: 'homepage',
      icon: <HomeOutlined />,
      label: '首页配置',
      onClick: () => navigate('/homepage')
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '统计分析',
      onClick: () => navigate('/statistics')
    }
  ];

  return (
    <Layout className="main-layout">
      <Sider width={200} className="site-layout-background">
        <div className="logo">音频CMS</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['audio']}
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