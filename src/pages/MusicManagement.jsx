import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, message, 
  Popconfirm, Tag, Input, Select, Card, Typography, Image
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, LinkOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getMusic, addMusic, updateMusic, deleteMusic } from '../api/musicApi';
import { getCategories } from '../api/categoryApi';
import MusicForm from '../components/MusicForm';
import '../styles/musicManagement.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const MusicManagement = () => {
  // 状态
  const [music, setMusic] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    categoryId: null,
    searchText: ''
  });

  // 获取音乐列表
  const fetchMusic = async (page = 1, pageSize = 10, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize
      };
      
      if (filters.categoryId) {
        params.categoryId = filters.categoryId;
      }
      
      const result = await getMusic(params);
      if (result.success) {
        // 如果有搜索文本，在前端过滤
        let filteredData = result.data;
        if (filters.searchText) {
          const searchText = filters.searchText.toLowerCase();
          filteredData = filteredData.filter(item => 
            (item.name && item.name.toLowerCase().includes(searchText))
          );
        }
        
        setMusic(filteredData);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: result.total
        });
      } else {
        message.error(result.error || '获取音乐列表失败');
      }
    } catch (error) {
      console.error('获取音乐列表失败:', error);
      message.error('获取音乐列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error(result.error || '获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      message.error('获取分类列表失败: ' + error.message);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchMusic(pagination.current, pagination.pageSize, filters);
    fetchCategories();
  }, []);

  // 处理表格变化
  const handleTableChange = (pagination, filters, sorter) => {
    fetchMusic(pagination.current, pagination.pageSize, filters);
  };

  // 处理搜索
  const handleSearch = (value) => {
    const newFilters = { ...filters, searchText: value };
    setFilters(newFilters);
    fetchMusic(1, pagination.pageSize, newFilters);
  };

  // 处理分类筛选
  const handleCategoryFilter = (value) => {
    const newFilters = { ...filters, categoryId: value };
    setFilters(newFilters);
    fetchMusic(1, pagination.pageSize, newFilters);
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setFilters({
      categoryId: null,
      searchText: ''
    });
    fetchMusic(1, pagination.pageSize, {});
  };

  // 打开添加音乐表单
  const openAddForm = () => {
    setCurrentMusic(null);
    setFormModalVisible(true);
  };

  // 打开编辑音乐表单
  const openEditForm = (record) => {
    setCurrentMusic(record);
    setFormModalVisible(true);
  };

  // 关闭表单
  const closeFormModal = () => {
    setFormModalVisible(false);
    setCurrentMusic(null);
  };

  // 处理表单提交
  const handleFormSubmit = async (values) => {
    setFormLoading(true);
    try {
      if (currentMusic) {
        // 更新音乐
        const result = await updateMusic(currentMusic._id, values);
        if (result.success) {
          message.success('音乐更新成功');
          closeFormModal();
          fetchMusic(pagination.current, pagination.pageSize, filters);
        } else {
          message.error(result.error || '更新音乐失败');
        }
      } else {
        // 添加音乐
        const result = await addMusic(values);
        if (result.success) {
          message.success('音乐添加成功');
          closeFormModal();
          fetchMusic(pagination.current, pagination.pageSize, filters);
        } else {
          message.error(result.error || '添加音乐失败');
        }
      }
    } catch (error) {
      console.error('提交表单失败:', error);
      message.error('提交表单失败: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // 处理删除音乐
  const handleDelete = async (id) => {
    try {
      const result = await deleteMusic(id);
      if (result.success) {
        message.success('音乐删除成功');
        fetchMusic(pagination.current, pagination.pageSize, filters);
      } else {
        message.error(result.error || '删除音乐失败');
      }
    } catch (error) {
      console.error('删除音乐失败:', error);
      message.error('删除音乐失败: ' + error.message);
    }
  };

  // 获取分类名称
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category) return '未分类';
    
    if (category.parentId) {
      const parentCategory = categories.find(c => c._id === category.parentId);
      if (parentCategory) {
        return `${parentCategory.name} / ${category.name}`;
      }
    }
    
    return category.name;
  };

  // 渲染图片
  const renderImage = (url) => {
    if (!url) return '-';
    return (
      <Image 
        src={url} 
        width={60} 
        height={60}
        style={{ objectFit: 'contain' }}
        placeholder={<div style={{ width: 60, height: 60, background: '#f0f0f0' }} />}
      />
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '音乐名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="music-name-cell">
          {record.listImageUrl && (
            <Image 
              src={record.listImageUrl} 
              alt={text}
              className="music-thumbnail"
              preview={false}
            />
          )}
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: categoryId => (
        <Tag color="blue">{getCategoryName(categoryId)}</Tag>
      ),
    },
    {
      title: '背景图',
      dataIndex: 'backgroundUrl',
      key: 'backgroundUrl',
      render: renderImage
    },
    {
      title: '列表图',
      dataIndex: 'listImageUrl',
      key: 'listImageUrl',
      render: renderImage
    },
    {
      title: '播放图标',
      dataIndex: 'iconUrl',
      key: 'iconUrl',
      render: renderImage
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: time => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-',
      sorter: (a, b) => {
        if (!a.createTime || !b.createTime) return 0;
        return new Date(a.createTime) - new Date(b.createTime);
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => openEditForm(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个音乐吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="music-management-container">
      <Card className="music-management-card">
        <div className="music-management-header">
          <Title level={2}>音乐管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={openAddForm}
          >
            添加音乐
          </Button>
        </div>
        
        <div className="music-filter-container">
          <div className="filter-item">
            <Input.Search
              placeholder="搜索音乐名称"
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              value={filters.searchText}
              onChange={e => setFilters({...filters, searchText: e.target.value})}
            />
          </div>
          
          <div className="filter-item">
            <Select
              placeholder="按分类筛选"
              style={{ width: 200 }}
              allowClear
              value={filters.categoryId}
              onChange={handleCategoryFilter}
            >
              {categories.map(category => {
                // 一级分类
                if (!category.parentId) {
                  return (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  );
                }
                return null;
              })}
              {categories.map(category => {
                // 二级分类
                if (category.parentId) {
                  const parentCategory = categories.find(c => c._id === category.parentId);
                  return (
                    <Option key={category._id} value={category._id}>
                      {parentCategory ? `${parentCategory.name} / ${category.name}` : category.name}
                    </Option>
                  );
                }
                return null;
              })}
            </Select>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleResetFilters}
              style={{ marginLeft: 8 }}
            >
              重置
            </Button>
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={music}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: total => `共 ${total} 条记录`
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      <Modal
        title={currentMusic ? '编辑音乐' : '添加音乐'}
        open={formModalVisible}
        onCancel={closeFormModal}
        footer={null}
        width={700}
        destroyOnClose={true}
      >
        <MusicForm
          initialValues={currentMusic}
          onFinish={handleFormSubmit}
          onCancel={closeFormModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
};

export default MusicManagement; 