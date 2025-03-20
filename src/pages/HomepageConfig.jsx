import React, { useEffect, useState } from 'react';
import { 
  Form, Input, Button, Card, message, 
  Select, Divider, Table, Tag, Switch 
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchHomepageConfig, 
  updateHomepageConfig 
} from '../redux/slices/homepageSlice';
import { fetchAudioList } from '../redux/slices/audioSlice';

const { Option } = Select;

const HomepageConfig = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const { config, loading } = useSelector((state) => state.homepage);
  const { audioList } = useSelector((state) => state.audio);
  
  const [selectedAudios, setSelectedAudios] = useState([]);
  
  // 加载首页配置和音频列表
  useEffect(() => {
    dispatch(fetchHomepageConfig());
    dispatch(fetchAudioList({ pageSize: 100 }));
  }, [dispatch]);
  
  // 当配置加载完成后，填充表单
  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        title: config.title,
        subtitle: config.subtitle,
      });
      
      if (config.recommendedAudios) {
        setSelectedAudios(config.recommendedAudios);
      }
    }
  }, [config, form]);
  
  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const configData = {
          ...values,
          recommendedAudios: selectedAudios
        };
        
        dispatch(updateHomepageConfig(configData))
          .unwrap()
          .then(() => {
            message.success('首页配置更新成功');
          })
          .catch(error => {
            message.error('更新失败: ' + error.message);
          });
      });
  };
  
  // 处理推荐音频选择
  const handleRecommendChange = (audioId, isRecommended) => {
    if (isRecommended) {
      // 添加到推荐列表
      const audioToAdd = audioList.data.find(audio => audio._id === audioId);
      if (audioToAdd) {
        setSelectedAudios([...selectedAudios, audioToAdd]);
      }
    } else {
      // 从推荐列表移除
      setSelectedAudios(selectedAudios.filter(audio => audio._id !== audioId));
    }
  };
  
  // 音频表格列定义
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
      render: (mainTab, record) => (
        <>
          <Tag color="blue">{mainTab}</Tag>
          <Tag color="green">{record.subTab}</Tag>
        </>
      ),
    },
    {
      title: '推荐',
      key: 'recommend',
      render: (_, record) => {
        const isRecommended = selectedAudios.some(
          audio => audio._id === record._id
        );
        
        return (
          <Switch
            checked={isRecommended}
            onChange={(checked) => handleRecommendChange(record._id, checked)}
          />
        );
      }
    }
  ];
  
  return (
    <div className="homepage-config-container">
      <h2>首页配置</h2>
      
      <Card title="基本设置" style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="首页标题"
            rules={[{ required: true, message: '请输入首页标题' }]}
          >
            <Input placeholder="请输入首页标题" />
          </Form.Item>
          
          <Form.Item
            name="subtitle"
            label="首页副标题"
          >
            <Input placeholder="请输入首页副标题" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Divider orientation="left">推荐音频</Divider>
      
      <Card title="选择要在首页推荐的音频">
        <Table 
          columns={columns} 
          dataSource={audioList.data} 
          rowKey="_id"
        />
        
        <div style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            loading={loading}
          >
            保存推荐设置
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HomepageConfig; 