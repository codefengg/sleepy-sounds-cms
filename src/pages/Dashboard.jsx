import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { 
  SoundOutlined, 
  PlayCircleOutlined, 
  TagsOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../redux/slices/statisticsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.statistics);
  
  useEffect(() => {
    dispatch(fetchStatistics());
  }, [dispatch]);
  
  return (
    <div className="dashboard-container">
      <h2>仪表盘</h2>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="音频总数" 
                value={data?.totalAudios || 0} 
                prefix={<SoundOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="总播放次数" 
                value={data?.totalPlays || 0} 
                prefix={<PlayCircleOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="分类数量" 
                value={data?.totalCategories || 0} 
                prefix={<TagsOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic 
                title="推荐音频数" 
                value={data?.recommendedAudios || 0} 
                prefix={<SoundOutlined />} 
              />
            </Card>
          </Col>
        </Row>
        
        <Card title="平台概览" style={{ marginTop: 24 }}>
          <p>欢迎使用音频内容管理系统！</p>
          <p>这里是音频内容管理的中央控制台，您可以查看系统运行状态和关键指标。</p>
          <p>使用左侧菜单导航到不同的功能页面，管理您的音频内容和应用配置。</p>
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard; 