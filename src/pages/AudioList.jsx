import React, { useEffect } from 'react';
import { Button, Table, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAudioList } from '../redux/slices/audioSlice';

const AudioList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { audioList, loading } = useSelector((state) => state.audio);

  useEffect(() => {
    dispatch(fetchAudioList());
  }, [dispatch]);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'mainTab',
      key: 'mainTab',
      render: (mainTab, record) => `${mainTab} / ${record.subTab}`,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => navigate(`/audio/edit/${record._id}`)}>编辑</a>
        </Space>
      ),
    }
  ];

  return (
    <div className="audio-list-container">
      <div className="audio-list-header">
        <h2>音频管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/audio/add')}
        >
          添加音频
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={audioList.data} 
        rowKey="_id"
        loading={loading}
        pagination={{
          total: audioList.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`
        }}
      />
    </div>
  );
};

export default AudioList; 