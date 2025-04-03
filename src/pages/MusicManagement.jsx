import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, Button, Space, Modal, message, 
  Popconfirm, Tag, Input, Select, Card, Typography, Image, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, ReloadOutlined, LinkOutlined, InfoCircleOutlined, OrderedListOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  getMusic, addMusic, updateMusic, deleteMusic, 
  batchUpdateMusicOrder, initializeOrderValues 
} from '../api/musicApi';
import { getCategories } from '../api/categoryApi';
import MusicForm from '../components/MusicForm';
import '../styles/musicManagement.scss';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { Title, Text } = Typography;
const { Option } = Select;

// 定义拖拽类型
const type = 'DraggableRow';

// 可拖拽的表格行组件
const DraggableRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = useRef();
  
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? 'drop-over-downward' : 'drop-over-upward',
      };
    },
    drop: item => {
      moveRow(item.index, index);
    },
  });
  
  const [, drag] = useDrag({
    type,
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drop(drag(ref));
  
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? ` ${dropClassName}` : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};

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
  const [orderType, setOrderType] = useState('globalOrder'); // 'globalOrder' 或 'categoryOrder'
  const [savingOrder, setSavingOrder] = useState(false);
  const [showInitButton, setShowInitButton] = useState(false);

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
        
        // 根据当前排序类型排序
        const sortedData = [...filteredData].sort((a, b) => {
          // 检查是否有排序值，如果没有则显示初始化按钮
          if (a[orderType] === undefined || b[orderType] === undefined) {
            setShowInitButton(true);
            return 0;
          }
          return (a[orderType] || 0) - (b[orderType] || 0);
        });
        
        setMusic(sortedData);
        setPagination({
          ...pagination,
          current: page,
          pageSize,
          total: result.total || filteredData.length
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

  // 当排序类型变化时重新获取数据
  useEffect(() => {
    fetchMusic(pagination.current, pagination.pageSize, filters);
  }, [orderType]);

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
      let result;
      
      if (currentMusic) {
        // 更新音乐
        result = await updateMusic(currentMusic._id, values);
      } else {
        // 添加音乐
        result = await addMusic(values);
      }
      
      if (result.success) {
        message.success(currentMusic ? '音乐更新成功' : '音乐添加成功');
        closeFormModal();
        fetchMusic(pagination.current, pagination.pageSize, filters);
      } else {
        message.error(result.error || (currentMusic ? '更新音乐失败' : '添加音乐失败'));
      }
    } catch (error) {
      console.error(currentMusic ? '更新音乐失败:' : '添加音乐失败:', error);
      message.error((currentMusic ? '更新音乐失败: ' : '添加音乐失败: ') + error.message);
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

  // 处理排序类型变更
  const handleOrderTypeChange = (value) => {
    setOrderType(value);
  };

  // 初始化排序值
  const initializeOrders = async () => {
    try {
      setLoading(true);
      const result = await initializeOrderValues();
      if (result.success) {
        message.success('排序值初始化成功');
        setShowInitButton(false);
        fetchMusic(pagination.current, pagination.pageSize, filters);
      } else {
        message.error('排序值初始化失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('初始化排序值失败:', error);
      message.error('初始化排序值失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理拖拽排序
  const moveRow = async (dragIndex, hoverIndex) => {
    // 更新本地状态
    const dragRow = music[dragIndex];
    const newData = [...music];
    newData.splice(dragIndex, 1);
    newData.splice(hoverIndex, 0, dragRow);
    setMusic(newData);
    
    // 计算新的排序值
    const updatedItems = newData.map((item, index) => ({
      id: item._id,
      order: (index + 1) * 10 // 使用间隔为10的排序值
    }));
    
    // 保存到服务器
    try {
      setSavingOrder(true);
      
      const result = await batchUpdateMusicOrder({
        items: updatedItems,
        orderType
      });
      
      if (!result.success) {
        message.error('保存排序失败: ' + (result.error || '未知错误'));
        // 如果保存失败，重新获取数据
        fetchMusic(pagination.current, pagination.pageSize, filters);
      }
    } catch (error) {
      console.error('保存排序失败:', error);
      message.error('保存排序失败，请重试');
      // 如果出错，重新获取数据
      fetchMusic(pagination.current, pagination.pageSize, filters);
    } finally {
      setSavingOrder(false);
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
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    {
      title: '音乐名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {text}
          {record.isNew && <Tag color="green">新</Tag>}
        </Space>
      )
    },
    {
      title: '所属分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => {
        const category = categories.find(c => c._id === categoryId);
        if (!category) return '-';
        
        if (category.parentId) {
          const parentCategory = categories.find(c => c._id === category.parentId);
          return parentCategory ? `${parentCategory.name} / ${category.name}` : category.name;
        }
        
        return category.name;
      }
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
      render: (createTime) => createTime ? moment(createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '播放次数',
      dataIndex: 'playCount',
      key: 'playCount',
      render: (playCount) => playCount || 0
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
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
          <Space>
            {showInitButton && (
              <Tooltip title="初始化所有音乐的排序值">
                <Button 
                  icon={<OrderedListOutlined />} 
                  onClick={initializeOrders}
                  loading={loading}
                >
                  初始化排序值
                </Button>
              </Tooltip>
            )}
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openAddForm}
            >
              添加音乐
            </Button>
          </Space>
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
            
            <Select
              value={orderType}
              style={{ width: 150, marginLeft: 16 }}
              onChange={handleOrderTypeChange}
            >
              <Option value="globalOrder">全局排序</Option>
              <Option value="categoryOrder">分类内排序</Option>
            </Select>
          </div>
        </div>
        
        <div className="sort-instructions">
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          <Text type="secondary">
            提示: 拖拽音乐行可以调整{orderType === 'globalOrder' ? '全局' : '分类内'}排序。当前使用
            <Text strong>{orderType === 'globalOrder' ? '全局排序' : '分类内排序'}</Text>。
          </Text>
        </div>
        
        <DndProvider backend={HTML5Backend}>
          <Table
            components={{
              body: {
                row: DraggableRow,
              },
            }}
            loading={loading || savingOrder}
            dataSource={music}
            columns={columns}
            rowKey="_id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: total => `共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            onRow={(record, index) => ({
              index,
              moveRow,
            })}
          />
        </DndProvider>
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