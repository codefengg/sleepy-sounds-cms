import React, { useState, useEffect } from 'react';
import {
  Table, Button, Form, Input, InputNumber, Modal, Tag,
  message, Popconfirm, Space, Typography, Avatar, Upload
} from 'antd';
import {
  PlusOutlined, PictureOutlined, EditOutlined, DeleteOutlined,
  ExclamationCircleOutlined, AppstoreOutlined, LoadingOutlined
} from '@ant-design/icons';
import { getCategories, addCategory, updateCategory, deleteCategory, uploadImageToCloud } from '../api/categoryApi';
import '../styles/category.scss';

const { Text, Title } = Typography;

const CategoryManagement = () => {
  // 状态
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('add-main'); // 'add-main', 'add-sub', 'edit'
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [iconUploading, setIconUploading] = useState(false);
  const [iconUrl, setIconUrl] = useState('');

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
      } else {
        message.error('获取分类列表失败: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  // 打开添加一级分类模态框
  const openAddMainCategoryModal = () => {
    setModalType('add-main');
    setSelectedCategory(null);
    setIconUrl('');
    form.resetFields();
    setModalVisible(true);
  };

  // 打开添加二级分类模态框
  const openAddSubCategoryModal = (parentCategory) => {
    setModalType('add-sub');
    setSelectedCategory(parentCategory);
    form.resetFields();
    form.setFieldsValue({
      parentId: parentCategory._id
    });
    setModalVisible(true);
  };

  // 打开编辑分类模态框
  const openEditCategoryModal = (category) => {
    setModalType(category.parentId ? 'edit-sub' : 'edit-main');
    setSelectedCategory(category);
    setIconUrl(category.iconUrl || '');
    form.resetFields();
    form.setFieldsValue({
      name: category.name,
      order: category.order,
      parentId: category.parentId,
      iconUrl: category.iconUrl
    });
    setModalVisible(true);
  };

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // 处理表单提交
  const handleFormSubmit = async (values) => {
    try {
      // 如果是一级分类，添加图标URL
      if ((modalType === 'add-main' || modalType === 'edit-main') && iconUrl) {
        values.iconUrl = iconUrl;
      }

      if (modalType === 'add-main' || modalType === 'add-sub') {
        // 添加分类
        const result = await addCategory(values);
        if (result.success) {
          message.success('添加分类成功');
          closeModal();
          fetchCategories();

          // 如果是添加二级分类，展开父分类
          if (modalType === 'add-sub' && selectedCategory) {
            setExpandedRowKeys([...expandedRowKeys, selectedCategory._id]);
          }
        } else {
          message.error(result.error || '添加分类失败');
        }
      } else {
        // 编辑分类
        const result = await updateCategory({
          id: selectedCategory._id,
          ...values
        });
        if (result.success) {
          message.success('更新分类成功');
          closeModal();
          fetchCategories();
        } else {
          message.error(result.error || '更新分类失败');
        }
      }
    } catch (error) {
      console.error('操作分类失败:', error);
      message.error('操作失败: ' + error.message);
    }
  };

  // 处理删除分类
  const handleDeleteCategory = async (category) => {
    try {
      const result = await deleteCategory(category._id);
      if (result.success) {
        message.success('删除分类成功');
        fetchCategories();
      } else {
        message.error(result.error || '删除分类失败');
      }
    } catch (error) {
      console.error('删除分类失败:', error);
      message.error('删除失败: ' + error.message);
    }
  };

  // 处理表格展开/收起
  const handleExpandRow = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record._id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record._id));
    }
  };

  // 上传前检查文件
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    
    return true;
  };

  // 自定义上传请求
  const customUploadRequest = ({ file, onSuccess }) => {
    // 这里不做实际上传，只是标记为成功
    // 实际上传在handleIconUpload中处理
    setTimeout(() => {
      onSuccess();
    }, 0);
  };

  // 处理图标上传
  const handleIconUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setIconUploading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      // 上传成功，处理文件
      try {
        const result = await uploadImageToCloud(info.file.originFileObj);
        if (result.success) {
          setIconUrl(result.fileUrl);
          form.setFieldsValue({ iconUrl: result.fileUrl });
          message.success('图标上传成功');
        } else {
          message.error(result.error || '图标上传失败');
        }
      } catch (error) {
        console.error('上传图标失败:', error);
        message.error('上传图标失败: ' + error.message);
      } finally {
        setIconUploading(false);
      }
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      {iconUploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图标</div>
    </div>
  );

  // 主分类表格列定义
  const mainColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.iconUrl && (
            <Avatar src={record.iconUrl} shape="square" size="small" />
          )}
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => openAddSubCategoryModal(record)}
          >
            添加子分类
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditCategoryModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            description="删除后将同时删除其所有子分类，且无法恢复！"
            onConfirm={() => handleDeleteCategory(record)}
            okText="确定"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              type="link"
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

  // 子分类表格列定义
  const subColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditCategoryModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDeleteCategory(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
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

  // 获取主分类数据
  const mainCategories = categories.filter(category => !category.parentId);

  // 获取子分类数据
  const getSubCategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // 渲染子表格
  const expandedRowRender = (record) => {
    const subCategoryData = getSubCategories(record._id);
    return (
      <Table
        columns={subColumns}
        dataSource={subCategoryData}
        pagination={false}
        rowKey="_id"
      />
    );
  };

  return (
    <div className="category-management-container">
      <div className="category-header">
        <Title level={2}>分类管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddMainCategoryModal}
        >
          添加一级分类
        </Button>
      </div>

      <div className="categories-table">
        <Table
          columns={mainColumns}
          dataSource={mainCategories}
          expandable={{
            expandedRowRender,
            onExpand: handleExpandRow,
            expandedRowKeys,
          }}
          rowKey="_id"
          loading={loading}
        />
      </div>

      <Modal
        title={
          modalType === 'add-main' ? '添加一级分类' :
            modalType === 'add-sub' ? '添加二级分类' :
              modalType === 'edit-main' ? '编辑一级分类' : '编辑二级分类'
        }
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>

          <Form.Item
            name="order"
            label="排序"
            initialValue={0}
            rules={[{ type: 'number', message: '请输入数字' }]}
          >
            <InputNumber min={0} placeholder="数字越小排序越靠前" style={{ width: '100%' }} />
          </Form.Item>

          {modalType === 'add-sub' && (
            <Form.Item
              name="parentId"
              label="父级分类"
              hidden
            >
              <Input disabled />
            </Form.Item>
          )}

          {(modalType === 'add-main' || modalType === 'edit-main') && (
            <Form.Item
              name="iconUrl"
              label="分类图标"
              hidden
            >
              <Input />
            </Form.Item>
          )}

          {(modalType === 'add-main' || modalType === 'edit-main') && (
            <Form.Item label="分类图标">
              <Upload
                name="icon"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                customRequest={customUploadRequest}
                onChange={handleIconUpload}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt="分类图标" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          )}

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

export default CategoryManagement; 