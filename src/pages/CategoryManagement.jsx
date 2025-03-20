import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Modal, Form, 
  Input, Select, message, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../redux/slices/categorySlice';

const { Option } = Select;

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);
  
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // 加载分类数据
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '主分类',
      dataIndex: 'mainTab',
      key: 'mainTab',
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
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
  
  // 处理添加按钮点击
  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };
  
  // 处理编辑按钮点击
  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      mainTab: category.mainTab,
      order: category.order
    });
    setModalVisible(true);
  };
  
  // 处理删除
  const handleDelete = (id) => {
    dispatch(deleteCategory(id))
      .unwrap()
      .then(() => {
        message.success('分类删除成功');
      })
      .catch(error => {
        message.error('删除失败: ' + error.message);
      });
  };
  
  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const categoryData = { ...values };
        
        if (editingCategory) {
          // 更新分类
          dispatch(updateCategory({ 
            ...categoryData, 
            _id: editingCategory._id 
          }))
            .unwrap()
            .then(() => {
              message.success('分类更新成功');
              setModalVisible(false);
            })
            .catch(error => {
              message.error('更新失败: ' + error.message);
            });
        } else {
          // 添加分类
          dispatch(addCategory(categoryData))
            .unwrap()
            .then(() => {
              message.success('分类添加成功');
              setModalVisible(false);
            })
            .catch(error => {
              message.error('添加失败: ' + error.message);
            });
        }
      });
  };
  
  return (
    <div className="category-management-container">
      <div className="category-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: 24 
      }}>
        <h2>分类管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加分类
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={categories} 
        rowKey="_id"
        loading={loading}
      />
      
      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ order: 0 }}
        >
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          
          <Form.Item
            name="mainTab"
            label="主分类"
            rules={[{ required: true, message: '请选择主分类' }]}
          >
            <Select placeholder="请选择主分类">
              <Option value="助眠">助眠</Option>
              <Option value="呼吸">呼吸</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="order"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <Input type="number" placeholder="请输入排序值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement; 