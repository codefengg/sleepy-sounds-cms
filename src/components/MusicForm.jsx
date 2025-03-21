import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, message } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import ImageSelector from './ImageSelector';
import { getCategories } from '../api/categoryApi';
import '../styles/musicForm.scss';

const { Option } = Select;
const { TextArea } = Input;

const MusicForm = ({ initialValues, onFinish, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageType, setImageType] = useState(null);
  const [imageSelector, setImageSelector] = useState({
    visible: false,
    field: null,
    title: ''
  });

  // 获取所有分类
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

  // 组件挂载时获取分类列表
  useEffect(() => {
    fetchCategories();
  }, []);

  // 当有初始值时，设置表单字段
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 打开图片选择器
  const openImageSelector = (field, title, type) => {
    console.log('打开图片选择器:', field, title, type); // 添加日志
    setImageType(type);
    setImageSelector({
      visible: true,
      field,
      title
    });
  };

  // 关闭图片选择器
  const closeImageSelector = () => {
    setImageSelector({
      ...imageSelector,
      visible: false
    });
  };

  // 处理图片选择
  const handleImageSelect = (image) => {
    console.log('选择图片:', image); // 添加日志
    form.setFieldsValue({
      [imageSelector.field]: image.url
    });
    closeImageSelector();
  };

  // 渲染图片预览
  const renderImagePreview = (url, field, title, type) => {
    return (
      <div className="image-preview-container">
        {url ? (
          <div className="image-preview">
            <img src={url} alt={title} />
            <div className="image-actions">
              <Button 
                type="primary" 
                size="small"
                onClick={() => openImageSelector(field, title, type)}
              >
                更换
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            icon={<PictureOutlined />} 
            onClick={() => openImageSelector(field, title, type)}
          >
            选择{title}
          </Button>
        )}
      </div>
    );
  };

  // 处理表单提交
  const handleSubmit = (values) => {
    onFinish(values);
  };

  return (
    <div className="music-form-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues || {}}
      >
        <Form.Item
          name="audioUrl"
          label="音乐链接"
          rules={[{ required: true, message: '请输入音乐链接' }]}
        >
          <Input placeholder="请输入音乐链接" />
        </Form.Item>
        
        <Form.Item
          label="音乐名称"
          name="name"
          rules={[{ required: true, message: '请输入音乐名称' }]}
        >
          <Input placeholder="请输入音乐名称" />
        </Form.Item>
        
        <Form.Item
          label="标题"
          name="title"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>
        
        <Form.Item
          label="副标题"
          name="subtitle"
        >
          <Input placeholder="请输入副标题（可选）" />
        </Form.Item>
        
        <Form.Item
          name="categoryId"
          label="所属分类"
          rules={[{ required: true, message: '请选择所属分类' }]}
        >
          <Select placeholder="请选择所属分类">
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
        </Form.Item>
        
        <Form.Item
          name="backgroundUrl"
          label="背景图"
        >
          <Input hidden />
          {renderImagePreview(
            form.getFieldValue('backgroundUrl'), 
            'backgroundUrl', 
            '背景图',
            'background'
          )}
        </Form.Item>
        
        <Form.Item
          name="iconUrl"
          label="播放图标"
        >
          <Input hidden />
          {renderImagePreview(
            form.getFieldValue('iconUrl'), 
            'iconUrl', 
            '播放图标',
            'playIcon'
          )}
        </Form.Item>
        
        <Form.Item
          name="listImageUrl"
          label="列表图"
        >
          <Input hidden />
          {renderImagePreview(
            form.getFieldValue('listImageUrl'), 
            'listImageUrl', 
            '列表图',
            'listImage'
          )}
        </Form.Item>
        
        <Form.Item className="form-actions">
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              {initialValues ? '更新' : '添加'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
      
      <ImageSelector
        visible={imageSelector.visible}
        onCancel={closeImageSelector}
        onSelect={handleImageSelect}
        title={`选择${imageSelector.title}`}
        imageType={imageType}
      />
    </div>
  );
};

export default MusicForm; 