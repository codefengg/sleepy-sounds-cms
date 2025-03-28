import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Form, Input, InputNumber, Modal, Tag,
  message, Popconfirm, Space, Typography, Avatar
} from 'antd';
import {
  PlusOutlined, PictureOutlined
} from '@ant-design/icons';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import ImageSelector from '../components/ImageSelector';
import '../styles/category.scss';

const { Text } = Typography;

const CategoryManagement = () => {
  // 状态
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add-main'); // 'add-main', 'add-sub', 'edit'
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [imageSelector, setImageSelector] = useState({
    visible: false,
    field: null
  });

  // 获取分类列表
  const fetchCategories = async (retryCount = 0) => {
    setLoading(true);
    try {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        message.error(result.error || '获取分类列表失败');
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      
      // 如果是初始化错误且重试次数小于3，则等待1秒后重试
      if (error.message.includes('初始化') && retryCount < 3) {
        console.log(`等待SDK初始化，1秒后重试(${retryCount + 1}/3)...`);
        setTimeout(() => {
          fetchCategories(retryCount + 1);
        }, 1000);
        return;
      }
      
      message.error('获取分类列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  // 重置表单
  const resetForm = () => {
    form.resetFields();
  };

  // 打开添加一级分类弹窗
  const showAddMainCategoryModal = () => {
    resetForm();
    form.setFieldsValue({
      order: categories.filter(c => !c.parentId).length + 1
    });
    setModalType('add-main');
    setModalVisible(true);
  };

  // 打开添加二级分类弹窗
  const showAddSubCategoryModal = (parentCategory) => {
    resetForm();
    form.setFieldsValue({
      parentId: parentCategory._id,
      parentName: parentCategory.name,
      order: categories.filter(c => c.parentId === parentCategory._id).length + 1
    });
    setModalType('add-sub');
    setModalVisible(true);
    
    // 确保父分类行被展开
    if (!expandedRowKeys.includes(parentCategory._id)) {
      setExpandedRowKeys([...expandedRowKeys, parentCategory._id]);
    }
  };

  // 打开编辑分类弹窗
  const showEditCategoryModal = (category) => {
    resetForm();
    
    const formData = {
      name: category.name,
      order: category.order,
      iconUrl: category.iconUrl
    };
    
    if (category.parentId) {
      const parentCategory = categories.find(c => c._id === category.parentId);
      formData.parentId = category.parentId;
      formData.parentName = parentCategory ? parentCategory.name : '';
    }
    
    form.setFieldsValue(formData);
    setSelectedCategory(category);
    setModalType('edit');
    setModalVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
  };

  // 删除分类
  const handleDeleteCategory = async (category) => {
    try {
      const result = await deleteCategory(category._id);
      if (result.success) {
        message.success('分类删除成功');
        setSelectedCategory(null);
        // 重新获取分类列表
        fetchCategories();
      } else {
        message.error(result.error || '删除分类失败');
      }
    } catch (error) {
      message.error(`删除失败: ${error.message}`);
    }
  };

  // 打开图标选择器
  const openIconSelector = () => {
    setImageSelector({
      visible: true,
      field: 'iconUrl'
    });
  };

  // 关闭图标选择器
  const closeIconSelector = () => {
    setImageSelector({
      visible: false,
      field: null
    });
  };

  // 处理图标选择
  const handleIconSelect = (image) => {
    form.setFieldsValue({
      iconUrl: image.url
    });
    closeIconSelector();
  };

  // 提交表单
  const onFinish = async (values) => {
    const formData = { ...values };
    
    // 删除非API字段
    if (formData.parentName) delete formData.parentName;
    
    try {
      if (modalType === 'edit') {
        // 更新分类
        const result = await updateCategory({
          id: selectedCategory._id,
          ...formData
        });
        
        if (result.success) {
          message.success('分类更新成功');
          closeModal();
          // 重新获取分类列表
          fetchCategories();
        } else {
          message.error(result.error || '更新分类失败');
        }
      } else {
        // 添加分类 (主分类或子分类)
        const result = await addCategory(formData);
        
        if (result.success) {
          message.success('分类添加成功');
          closeModal();
          // 重新获取分类列表
          fetchCategories();
        } else {
          message.error(result.error || '添加分类失败');
        }
      }
    } catch (error) {
      message.error(`操作失败: ${error.message}`);
    }
  };

  // 处理表格展开/收起
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record._id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record._id));
    }
  };

  // 准备表格数据
  const tableData = categories
    .filter(cat => !cat.parentId)
    .sort((a, b) => a.order - b.order);

  // 获取子分类数据
  const getSubCategories = (parentId) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // 渲染图标
  const renderIcon = (iconUrl) => {
    if (iconUrl) {
      return <Avatar src={iconUrl} size="small" />;
    }
    return <Avatar icon={<PictureOutlined />} size="small" />;
  };

  // 表格列定义
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        // 渲染不同层级的分类样式
        if (!record.parentId) {
          return (
            <Space>
              {renderIcon(record.iconUrl)}
              <Text strong>{text}</Text>
            </Space>
          );
        } else {
          return <Text style={{ marginLeft: 50 }}>{text}</Text>;
        }
      }
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 100,
      render: (order) => <Text>{order}</Text>
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          {!record.parentId && (
            <Button 
              type="primary" 
              size="small"
              icon={<PlusOutlined />}
              onClick={() => showAddSubCategoryModal(record)}
            >
              添加子分类
            </Button>
          )}
          <Button 
            type="link" 
            size="small"
            onClick={() => showEditCategoryModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗?"
            description={!record.parentId ? "删除后其下的二级分类也会被删除" : "删除后无法恢复"}
            onConfirm={() => handleDeleteCategory(record)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="link" 
              danger
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="category-management-container">
      <div className="category-header">
        <h2>分类管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showAddMainCategoryModal}
        >
          添加一级分类
        </Button>
      </div>
      
      <Table
        className="categories-table"
        columns={columns}
        dataSource={tableData}
        rowKey="_id"
        loading={loading}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpand: handleExpand,
          expandIcon: ({ expanded, onExpand, record }) => 
            record.parentId ? null : (
              expanded ? (
                <Button type="text" onClick={e => onExpand(record, e)}>
                  <Tag color="processing">收起</Tag>
                </Button>
              ) : (
                <Button type="text" onClick={e => onExpand(record, e)}>
                  <Tag>展开</Tag>
                </Button>
              )
            ),
          expandedRowRender: record => {
            const subCategories = getSubCategories(record._id);
            if (subCategories.length === 0) {
              return <Text type="secondary" style={{ marginLeft: 50 }}>暂无子分类</Text>;
            }
            
            return (
              <Table 
                columns={columns}
                dataSource={subCategories}
                rowKey="_id"
                pagination={false}
                showHeader={false}
              />
            );
          }
        }}
      />
      
      {/* 添加/编辑分类弹窗 */}
      <Modal
        title={
          modalType === 'add-main' ? '添加一级分类' : 
          modalType === 'add-sub' ? '添加二级分类' : 
          '编辑分类'
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {(modalType === 'add-sub' || (modalType === 'edit' && selectedCategory?.parentId)) && (
            <>
              <Form.Item label="所属一级分类" name="parentName">
                <Input disabled />
              </Form.Item>
              <Form.Item hidden name="parentId">
                <Input />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            name="order"
            label="排序序号"
            rules={[{ required: true, message: '请输入排序值' }]}
            help="数字越小排序越靠前"
          >
            <InputNumber placeholder="请输入排序值" style={{ width: '100%' }} />
          </Form.Item>
          
          {/* 只有一级分类才显示图标选择 */}
          {(modalType === 'add-main' || (modalType === 'edit' && !selectedCategory?.parentId)) && (
            <Form.Item
              name="iconUrl"
              label="分类图标"
            >
              <Input hidden />
              <div className="icon-preview-container">
                {form.getFieldValue('iconUrl') ? (
                  <div className="icon-preview">
                    <img src={form.getFieldValue('iconUrl')} alt="分类图标" />
                    <div className="icon-actions">
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={openIconSelector}
                      >
                        更换图标
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    icon={<PictureOutlined />} 
                    onClick={openIconSelector}
                  >
                    选择图标
                  </Button>
                )}
              </div>
            </Form.Item>
          )}
          
          <Form.Item className="form-actions">
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: '20px' }}>
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
      
      {/* 图标选择器 */}
      <ImageSelector
        visible={imageSelector.visible}
        onCancel={closeIconSelector}
        onSelect={handleIconSelect}
        title="选择分类图标"
      />
    </div>
  );
};

export default CategoryManagement; 