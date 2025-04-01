import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Modal, Form, Input, TimePicker, 
  message, Popconfirm, Space, Typography, Tag
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  ClockCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getAllTimeTitles, addTimeTitle, updateTimeTitle, deleteTimeTitle } from '../api/titleApi';
import '../styles/titleManagement.scss';

const { Title, Text } = Typography;
const { RangePicker } = TimePicker;

const TitleManagement = () => {
  // 状态
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加时间段标题');
  const [form] = Form.useForm();
  const [currentTitle, setCurrentTitle] = useState(null);

  // 获取所有时间段标题
  const fetchTitles = async () => {
    setLoading(true);
    try {
      const result = await getAllTimeTitles();
      if (result.success) {
        setTitles(result.data);
      } else {
        message.error(result.error || '获取标题列表失败');
      }
    } catch (error) {
      console.error('获取标题列表失败:', error);
      message.error('获取标题列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTitles();
  }, []);

  // 打开添加模态框
  const openAddModal = () => {
    setModalTitle('添加时间段标题');
    setCurrentTitle(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (record) => {
    console.log('record', record);
    setModalTitle('编辑时间段标题');
    setCurrentTitle(record);
    
    // 设置表单初始值
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      // timeRange: [
      //   moment(record.startTime, 'HH:mm'),
      //   moment(record.endTime, 'HH:mm')
      // ]
    });
    
    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
  };

  // 处理表单提交
  const handleSubmit = async (values) => {
    try {
      const [startTime, endTime] = values.timeRange.map(time => time.format('HH:mm'));
      
      const data = {
        title: values.title,
        subtitle: values.subtitle || '',
        startTime,
        endTime
      };
      
      let result;
      
      if (currentTitle) {
        // 更新
        result = await updateTimeTitle({
          id: currentTitle._id,
          ...data
        });
      } else {
        // 添加
        result = await addTimeTitle(data);
      }
      
      if (result.success) {
        message.success(result.message || (currentTitle ? '更新成功' : '添加成功'));
        closeModal();
        fetchTitles();
      } else {
        message.error(result.error || (currentTitle ? '更新失败' : '添加失败'));
      }
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败: ' + error.message);
    }
  };

  // 处理删除
  const handleDelete = async (id) => {
    try {
      const result = await deleteTimeTitle({ id });
      
      if (result.success) {
        message.success(result.message || '删除成功');
        fetchTitles();
      } else {
        message.error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + error.message);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '时间范围',
      key: 'timeRange',
      render: (_, record) => (
        <Tag icon={<ClockCircleOutlined />} color="blue">
          {record.startTime} - {record.endTime}
        </Tag>
      ),
      sorter: (a, b) => {
        const aMinutes = convertTimeToMinutes(a.startTime);
        const bMinutes = convertTimeToMinutes(b.startTime);
        return aMinutes - bMinutes;
      }
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个时间段标题吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 辅助函数：将时间字符串转换为分钟数
  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="title-management-container">
      <Card className="title-management-card">
        <div className="title-management-header">
          <Title level={2}>标题管理</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
          >
            添加时间段标题
          </Button>
        </div>
        
        <div className="title-management-info">
          <Text type="secondary">
            <InfoCircleOutlined /> 不同时间段显示不同的标题和副标题，小程序会根据当前时间自动选择对应的标题显示。
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={titles}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="timeRange"
            label="时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker 
              format="HH:mm"
              placeholder={['开始时间', '结束时间']}
              style={{ width: '100%' }}
              getCalendarContainer={trigger => trigger.parentNode}
            />
          </Form.Item>
          
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" maxLength={20} />
          </Form.Item>
          
          <Form.Item
            name="subtitle"
            label="副标题"
          >
            <Input placeholder="请输入副标题（可选）" maxLength={30} />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TitleManagement; 