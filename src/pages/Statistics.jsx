import React, { useEffect, useState } from 'react';
import { 
  Card, Row, Col, DatePicker, Button, 
  Table, Spin, Statistic 
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../redux/slices/statisticsSlice';

const { RangePicker } = DatePicker;

const Statistics = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.statistics);
  
  const [dateRange, setDateRange] = useState([null, null]);
  
  useEffect(() => {
    // 初始加载统计数据
    dispatch(fetchStatistics());
  }, [dispatch]);
  
  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };
  
  // 处理查询按钮点击
  const handleSearch = () => {
    if (dateRange[0] && dateRange[1]) {
      dispatch(fetchStatistics({
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      }));
    }
  };
  
  // 模拟统计数据（实际应用中应该从后端获取）
  const mockData = {
    dailyPlays: [
      { date: '2023-11-01', count: 120 },
      { date: '2023-11-02', count: 150 },
      { date: '2023-11-03', count: 130 },
      { date: '2023-11-04', count: 190 },
      { date: '2023-11-05', count: 210 },
      { date: '2023-11-06', count: 170 },
      { date: '2023-11-07', count: 180 },
    ],
    topAudios: [
      { title: '安眠曲', playCount: 523, mainTab: '助眠', subTab: '音乐' },
      { title: '冥想引导', playCount: 421, mainTab: '助眠', subTab: '冥想' },
      { title: '雨声', playCount: 378, mainTab: '助眠', subTab: '自然声' },
      { title: '深呼吸练习', playCount: 356, mainTab: '呼吸', subTab: '练习' },
      { title: '森林漫步', playCount: 312, mainTab: '助眠', subTab: '自然声' },
    ]
  };
  
  // 表格列定义 - 每日播放数据
  const dailyColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '播放次数',
      dataIndex: 'count',
      key: 'count',
    }
  ];
  
  // 顶部音频表格列定义
  const audioColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      render: (_, __, index) => index + 1
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'mainTab',
      key: 'mainTab',
      render: (mainTab, record) => `${mainTab} / ${record.subTab}`
    },
    {
      title: '播放次数',
      dataIndex: 'playCount',
      key: 'playCount',
      sorter: (a, b) => a.playCount - b.playCount,
      defaultSortOrder: 'descend'
    },
  ];
  
  return (
    <div className="statistics-container">
      <div className="statistics-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: 24
      }}>
        <h2>统计分析</h2>
        
        <div className="date-range-picker">
          <RangePicker onChange={handleDateRangeChange} />
          <Button 
            type="primary" 
            onClick={handleSearch} 
            style={{ marginLeft: 8 }}
          >
            查询
          </Button>
        </div>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="每日播放统计">
              <Table 
                columns={dailyColumns} 
                dataSource={mockData.dailyPlays} 
                rowKey="date"
                pagination={false}
              />
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="热门音频排行">
              <Table 
                columns={audioColumns} 
                dataSource={mockData.topAudios} 
                rowKey="title"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Statistics; 