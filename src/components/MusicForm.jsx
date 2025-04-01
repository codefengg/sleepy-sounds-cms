import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, message } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import ImageSelector from './ImageSelector';
import { getCategories } from '../api/categoryApi';
import '../styles/musicForm.scss';
import AudioSelector from './AudioSelector';

const { Option } = Select;
const { TextArea } = Input;

const MusicForm = ({ initialValues, onFinish, onCancel, loading }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [imageSelector, setImageSelector] = useState({
    visible: false
  });
  const [audioSelector, setAudioSelector] = useState({
    visible: false
  });
  const [audioName, setAudioName] = useState('');

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
  const openImageSelector = () => {
    setImageSelector({
      visible: true
    });
  };

  // 关闭图片选择器
  const closeImageSelector = () => {
    setImageSelector({
      visible: false
    });
  };

  // 处理图片选择 - 现在一次性设置多个字段
  const handleImageSelect = (image) => {
    form.setFieldsValue({
      backgroundUrl: image.largeUrl,      // 背景图对应大图
      listImageUrl: image.thumbnailUrl,   // 列表图对应缩略图
      iconUrl: image.playUrl              // 播放图标对应播放图
    });
    closeImageSelector();
  };

  // 渲染图片预览区域
  const renderImagePreview = () => {
    const backgroundUrl = form.getFieldValue('backgroundUrl');
    const listImageUrl = form.getFieldValue('listImageUrl');
    const iconUrl = form.getFieldValue('iconUrl');
    
    const hasImages = backgroundUrl || listImageUrl || iconUrl;
    
    return (
      <div className="image-preview-container">
        {hasImages ? (
          <div className="image-preview-grid">
            <div className="image-preview-item">
              <div className="image-label">背景图</div>
              <div className="image-preview">
                {backgroundUrl ? (
                  <img src={backgroundUrl} alt="背景图" />
                ) : (
                  <div className="no-image">无图片</div>
                )}
              </div>
            </div>
            <div className="image-preview-item">
              <div className="image-label">列表图</div>
              <div className="image-preview">
                {listImageUrl ? (
                  <img src={listImageUrl} alt="列表图" />
                ) : (
                  <div className="no-image">无图片</div>
                )}
              </div>
            </div>
            <div className="image-preview-item">
              <div className="image-label">播放图标</div>
              <div className="image-preview">
                {iconUrl ? (
                  <img src={iconUrl} alt="播放图标" />
                ) : (
                  <div className="no-image">无图片</div>
                )}
              </div>
            </div>
            <div className="image-actions">
              <Button 
                type="primary" 
                onClick={openImageSelector}
              >
                更换图片
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            icon={<PictureOutlined />} 
            onClick={openImageSelector}
          >
            选择图片套装
          </Button>
        )}
      </div>
    );
  };

  // 打开音频选择器
  const openAudioSelector = () => {
    setAudioSelector({
      visible: true
    });
  };

  // 关闭音频选择器
  const closeAudioSelector = () => {
    setAudioSelector({
      visible: false
    });
  };

  // 处理音频选择
  const handleAudioSelect = (audio) => {
    form.setFieldsValue({
      audioUrl: audio.url,
    });
    closeAudioSelector();
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
      >
        <Form.Item
          name="audioUrl"
          label="音频"
          rules={[{ required: true, message: '请选择音频' }]}
        >
          <Input hidden />
          <div className="audio-preview-container">
            {form.getFieldValue('audioUrl') ? (
              <div className="audio-preview">
                <audio src={form.getFieldValue('audioUrl')} controls />
                <div>{audioName || form.getFieldValue('name')}</div>
                <Button 
                  type="link" 
                  onClick={openAudioSelector}
                >
                  更换音频
                </Button>
              </div>
            ) : (
              <Button onClick={openAudioSelector}>
                选择音频
              </Button>
            )}
          </div>
        </Form.Item>
        
        <Form.Item
          name="name"
          label="音乐名称"
          rules={[{ required: true, message: '请输入音乐名称' }]}
        >
          <Input placeholder="请输入音乐名称" />
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
        
        {/* 隐藏字段 - 用于存储图片URL */}
        <Form.Item name="backgroundUrl" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="iconUrl" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="listImageUrl" hidden>
          <Input />
        </Form.Item>
        
        <Form.Item label="图片设置">
          {renderImagePreview()}
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
        title="选择图片套装"
      />
      <AudioSelector
        visible={audioSelector.visible}
        onCancel={closeAudioSelector}
        onSelect={handleAudioSelect}
        title="选择音频"
      />
    </div>
  );
};

export default MusicForm; 