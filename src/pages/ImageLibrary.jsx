import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Upload, Modal, Input, Form, 
  message, Popconfirm, Space, Typography, Spin, 
  Row, Col, Select, Empty, Pagination, Tag, Image
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, 
  UploadOutlined 
} from '@ant-design/icons';
import { getImages, addImage, deleteImage, uploadImageToCloud } from '../api/imageApi';
import '../styles/imageLibrary.scss';

// 引入瀑布流组件
import Masonry from 'react-masonry-css';

const { Meta } = Card;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ImageLibrary = () => {
  // 状态
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });
  const [filterType, setFilterType] = useState(null);

  // 瀑布流的断点设置
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    992: 2,
    576: 1
  };

  // 获取图片列表
  const fetchImages = async (page = 1, pageSize = 12, type = null) => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize
      };
      
      if (type) {
        params.type = type;
      }
      
      const result = await getImages(params);
      if (result.success) {
        setImages(result.data);
        setPagination({
          current: page,
          pageSize,
          total: result.total
        });
      } else {
        message.error(result.error || '获取图片列表失败');
      }
    } catch (error) {
      console.error('获取图片列表失败:', error);
      message.error('获取图片列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取图片列表
  useEffect(() => {
    fetchImages(pagination.current, pagination.pageSize, filterType);
  }, []);

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    fetchImages(page, pageSize, filterType);
  };

  // 处理类型筛选变化
  const handleTypeChange = (value) => {
    setFilterType(value);
    fetchImages(1, pagination.pageSize, value);
  };

  // 打开上传图片弹窗
  const showUploadModal = () => {
    form.resetFields();
    setSelectedFile(null);
    setUploadModalVisible(true);
  };

  // 关闭上传图片弹窗
  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };

  // 处理文件选择
  const handleFileChange = (info) => {
    if (info.file) {
      setSelectedFile(info.file);
      // 自动填充文件名
      form.setFieldsValue({
        name: info.file.name.split('.')[0]
      });
    }
  };

  // 处理图片预览
  const handlePreview = (image) => {
    setPreviewImage(image.url);
    setPreviewTitle(image.name);
    setPreviewVisible(true);
  };

  // 关闭预览
  const handlePreviewCancel = () => {
    setPreviewVisible(false);
  };

  // 处理图片删除
  const handleDelete = async (id) => {
    try {
      const result = await deleteImage(id);
      if (result.success) {
        message.success('图片删除成功');
        // 重新获取图片列表
        fetchImages(pagination.current, pagination.pageSize, filterType);
      } else {
        message.error(result.error || '删除图片失败');
      }
    } catch (error) {
      message.error('删除图片失败: ' + error.message);
    }
  };

  // 处理表单提交
  const handleUpload = async (values) => {
    if (!selectedFile) {
      message.error('请选择要上传的图片');
      return;
    }

    setUploadLoading(true);
    try {
      // 1. 上传图片到云存储
      const uploadResult = await uploadImageToCloud(selectedFile);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || '上传图片失败');
      }

      // 2. 保存图片信息到数据库
      const imageData = {
        url: uploadResult.fileUrl,
        name: values.name,
        type: values.type || 'none',
        size: selectedFile.size,
      };

      const addResult = await addImage(imageData);
      if (addResult.success) {
        message.success('图片上传成功');
        closeUploadModal();
        // 重新获取图片列表
        fetchImages(pagination.current, pagination.pageSize, filterType);
      } else {
        throw new Error(addResult.error || '保存图片信息失败');
      }
    } catch (error) {
      message.error('上传图片失败: ' + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // 上传按钮
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>选择图片</div>
    </div>
  );

  // 在渲染图片卡片的地方
  const getTypeTag = (type) => {
    switch(type) {
      case 'background':
        return <Tag color="blue">背景图</Tag>;
      case 'playIcon':
        return <Tag color="green">播放图标</Tag>;
      case 'listImage':
        return <Tag color="purple">列表图</Tag>;
      case 'none':
      default:
        return <Tag>无</Tag>;
    }
  };

  return (
    <div className="image-library-container">
      <div className="image-library-header">
        <div className="header-left">
          <Title level={2}>图片库</Title>
          <Select
            placeholder="筛选图片类型"
            allowClear
            style={{ width: 200, marginLeft: 16 }}
            onChange={handleTypeChange}
            value={filterType}
          >
            <Option value="none">无</Option>
            <Option value="background">背景图</Option>
            <Option value="playIcon">播放图标</Option>
            <Option value="listImage">列表图</Option>
          </Select>
        </div>
        <Button 
          type="primary" 
          icon={<UploadOutlined />}
          onClick={showUploadModal}
        >
          上传图片
        </Button>
      </div>
      
      <Spin spinning={loading}>
        {images.length > 0 ? (
          <div className="image-gallery">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {images.map(image => (
                <div key={image._id} className="image-card-wrapper">
                  <Card
                    hoverable
                    className="image-card"
                    cover={
                      <div className="image-container">
                        <Image
                          src={image.url}
                          alt={image.name}
                          className="gallery-image"
                          preview={{
                            mask: <div className="preview-mask">预览</div>
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Popconfirm
                        title="确定要删除这张图片吗?"
                        description="删除后无法恢复"
                        onConfirm={() => handleDelete(image._id)}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <DeleteOutlined key="delete" />
                      </Popconfirm>
                    ]}
                  >
                    <Meta
                      title={image.name}
                      description={getTypeTag(image.type)}
                    />
                  </Card>
                </div>
              ))}
            </Masonry>
          </div>
        ) : (
          <Empty description="暂无图片" />
        )}
        
        {pagination.total > 0 && (
          <div className="pagination-container">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 张图片`}
            />
          </div>
        )}
      </Spin>
      
      {/* 上传图片弹窗 */}
      <Modal
        title="上传图片"
        open={uploadModalVisible}
        onCancel={closeUploadModal}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item label="选择图片">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
            >
              {selectedFile ? (
                <img 
                  src={URL.createObjectURL(selectedFile)} 
                  alt="预览" 
                  style={{ width: '100%' }} 
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="name"
            label="图片名称"
            rules={[{ required: true, message: '请输入图片名称' }]}
          >
            <Input placeholder="请输入图片名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="图片类型"
            initialValue="none"
          >
            <Select>
              <Option value="none">无</Option>
              <Option value="background">背景图</Option>
              <Option value="playIcon">播放图标</Option>
              <Option value="listImage">列表图</Option>
            </Select>
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeUploadModal}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={uploadLoading}
                disabled={!selectedFile}
              >
                上传
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 图片预览弹窗 */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={handlePreviewCancel}
      >
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ImageLibrary; 