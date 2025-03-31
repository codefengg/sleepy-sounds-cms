import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Upload, Modal, Input, Form, 
  message, Popconfirm, Space, Typography, Image
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, 
  EditOutlined
} from '@ant-design/icons';
import { getImages, addImage, deleteImage, updateImage, uploadImageToCloud } from '../api/imageApi';
import '../styles/imageLibrary.scss';

const { Title } = Typography;

const ImageLibrary = () => {
  // 状态
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加图片');
  const [editingImage, setEditingImage] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 上传文件状态
  const [uploadFiles, setUploadFiles] = useState({
    name: '',
    largeUrl: '',
    thumbnailUrl: '',
    playUrl: '',
    videoUrl: '',
    animatedUrl: ''
  });

  // 获取图片列表
  const fetchImages = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        limit: pagination.pageSize,
        skip: (page - 1) * pagination.pageSize
      };
      
      const result = await getImages(params);
      if (result.success) {
        setImages(result.data || []);
        setPagination({
          ...pagination,
          current: page,
          total: result.total || 0
        });
      } else {
        message.error(result.message || '获取图片列表失败');
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
    fetchImages();
  }, []);

  // 打开添加图片弹窗
  const showAddModal = () => {
    form.resetFields();
    setEditingImage(null);
    setModalTitle('添加图片');
    setUploadFiles({
      name: '',
      largeUrl: '',
      thumbnailUrl: '',
      playUrl: '',
      videoUrl: '',
      animatedUrl: ''
    });
    setModalVisible(true);
  };
  
  // 打开编辑图片弹窗
  const showEditModal = (record) => {
    setEditingImage(record);
    setModalTitle('编辑图片');
    form.setFieldsValue({
      name: record.name || ''
    });
    setUploadFiles({
      name: record.name || '',
      largeUrl: record.largeUrl || '',
      thumbnailUrl: record.thumbnailUrl || '',
      playUrl: record.playUrl || '',
      videoUrl: record.videoUrl || '',
      animatedUrl: record.animatedUrl || ''
    });
    setModalVisible(true);
  };

  // 关闭弹窗
  const closeModal = () => {
    setModalVisible(false);
  };

  // 处理上传大图
  const handleLargeUpload = (info) => {
    if (info.file.status === 'done') {
      setUploadFiles({
        ...uploadFiles,
        largeUrl: info.file.response.fileUrl
      });
      message.success('大图上传成功');
    } else if (info.file.status === 'error') {
      message.error('大图上传失败');
    }
  };

  // 处理上传缩略图
  const handleThumbnailUpload = (info) => {
    if (info.file.status === 'done') {
      setUploadFiles({
        ...uploadFiles,
        thumbnailUrl: info.file.response.fileUrl
      });
      message.success('缩略图上传成功');
    } else if (info.file.status === 'error') {
      message.error('缩略图上传失败');
    }
  };

  // 处理上传播放图
  const handlePlayUpload = (info) => {
    if (info.file.status === 'done') {
      setUploadFiles({
        ...uploadFiles,
        playUrl: info.file.response.fileUrl
      });
      message.success('播放图上传成功');
    } else if (info.file.status === 'error') {
      message.error('播放图上传失败');
    }
  };

  // 处理上传视频
  const handleVideoUpload = (info) => {
    if (info.file.status === 'done') {
      setUploadFiles({
        ...uploadFiles,
        videoUrl: info.file.response.fileUrl
      });
      message.success('视频上传成功');
    } else if (info.file.status === 'error') {
      message.error('视频上传失败');
    }
  };

  // 处理上传动画图
  const handleAnimatedUpload = (info) => {
    if (info.file.status === 'done') {
      setUploadFiles({
        ...uploadFiles,
        animatedUrl: info.file.response.fileUrl
      });
      message.success('动画图上传成功');
    } else if (info.file.status === 'error') {
      message.error('动画图上传失败');
    }
  };

  // 处理表单提交
  const handleFormSubmit = async (values) => {
    const { name } = values;
    
    // 验证必填项
    if (!uploadFiles.largeUrl || !uploadFiles.thumbnailUrl || !uploadFiles.playUrl) {
      message.error('请上传大图、缩略图和播放图');
      return;
    }
    
    try {
      const imageData = {
        name,
        largeUrl: uploadFiles.largeUrl,
        thumbnailUrl: uploadFiles.thumbnailUrl,
        playUrl: uploadFiles.playUrl,
        videoUrl: uploadFiles.videoUrl || '',
        animatedUrl: uploadFiles.animatedUrl || ''
      };
      
      let result;
      
      if (editingImage) {
        // 编辑模式
        result = await updateImage({
          _id: editingImage._id,
          ...imageData
        });
      } else {
        // 添加模式
        result = await addImage(imageData);
      }
      
      if (result.success) {
        message.success(editingImage ? '更新图片成功' : '添加图片成功');
        closeModal();
        fetchImages(1); // 刷新列表
      } else {
        message.error(result.message || (editingImage ? '更新图片失败' : '添加图片失败'));
      }
    } catch (error) {
      console.error(editingImage ? '更新图片失败:' : '添加图片失败:', error);
      message.error((editingImage ? '更新图片失败: ' : '添加图片失败: ') + error.message);
    }
  };

  // 处理删除图片
  const handleDelete = async (id) => {
    try {
      const result = await deleteImage(id);
      
      if (result.success) {
        message.success('删除成功');
        fetchImages(pagination.current); // 刷新当前页
      } else {
        message.error(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + error.message);
    }
  };

  // 处理分页变化
  const handleTableChange = (pagination) => {
    fetchImages(pagination.current);
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '大图',
      dataIndex: 'largeUrl',
      key: 'largeUrl',
      render: (url) => (
        url ? (
          <div className="image-thumbnail">
            <Image
              src={url}
              alt="大图"
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="image-placeholder">无图片</div>
        )
      )
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      render: (url) => (
        url ? (
          <div className="image-thumbnail">
            <Image
              src={url}
              alt="缩略图"
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="image-placeholder">无图片</div>
        )
      )
    },
    {
      title: '播放图',
      dataIndex: 'playUrl',
      key: 'playUrl',
      render: (url) => (
        url ? (
          <div className="image-thumbnail">
            <Image
              src={url}
              alt="播放图"
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="image-placeholder">无图片</div>
        )
      )
    },
    {
      title: '视频',
      dataIndex: 'videoUrl',
      key: 'videoUrl',
      render: (url) => (
        url ? (
          <div className="video-thumbnail">
            <a href={url} target="_blank" rel="noopener noreferrer">查看视频</a>
          </div>
        ) : (
          <div className="image-placeholder">无视频</div>
        )
      )
    },
    {
      title: '动画图',
      dataIndex: 'animatedUrl',
      key: 'animatedUrl',
      render: (url) => (
        url ? (
          <div className="image-thumbnail">
            <Image
              src={url}
              alt="动画图"
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div className="image-placeholder">无图片</div>
        )
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="确定要删除这张图片吗?"
            onConfirm={() => handleDelete(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="image-library-container">
      <div className="image-library-header">
        <Title level={2}>图片库</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
        >
          添加图片
        </Button>
      </div>
      
      <Table
        className="images-table"
        columns={columns}
        dataSource={images}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      
      {/* 添加/编辑图片弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        className="upload-modal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          <Form.Item
            name="name"
            label="图片名称"
            rules={[{ required: true, message: '请输入图片名称' }]}
          >
            <Input placeholder="请输入图片名称" />
          </Form.Item>
          
          <div className="upload-section">
            <div className="upload-row">
              <div className="upload-col">
                <Form.Item
                  label="大图 (必填)"
                  required
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleLargeUpload}
                    customRequest={({ file, onSuccess, onError }) => {
                      uploadImageToCloud(file)
                        .then(res => {
                          if (res.success) {
                            onSuccess({ fileUrl: res.fileUrl });
                          } else {
                            onError(res.error || '上传失败');
                          }
                        })
                        .catch(err => onError(err));
                    }}
                  >
                    {uploadFiles.largeUrl ? (
                      <img src={uploadFiles.largeUrl} alt="大图" style={{ width: '100%' }} />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传大图</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
              
              <div className="upload-col">
                <Form.Item
                  label="缩略图 (必填)"
                  required
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleThumbnailUpload}
                    customRequest={({ file, onSuccess, onError }) => {
                      uploadImageToCloud(file)
                        .then(res => {
                          if (res.success) {
                            onSuccess({ fileUrl: res.fileUrl });
                          } else {
                            onError(res.error || '上传失败');
                          }
                        })
                        .catch(err => onError(err));
                    }}
                  >
                    {uploadFiles.thumbnailUrl ? (
                      <img src={uploadFiles.thumbnailUrl} alt="缩略图" style={{ width: '100%' }} />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传缩略图</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
            
            <div className="upload-row">
              <div className="upload-col">
                <Form.Item
                  label="播放图 (必填)"
                  required
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handlePlayUpload}
                    customRequest={({ file, onSuccess, onError }) => {
                      uploadImageToCloud(file)
                        .then(res => {
                          if (res.success) {
                            onSuccess({ fileUrl: res.fileUrl });
                          } else {
                            onError(res.error || '上传失败');
                          }
                        })
                        .catch(err => onError(err));
                    }}
                  >
                    {uploadFiles.playUrl ? (
                      <img src={uploadFiles.playUrl} alt="播放图" style={{ width: '100%' }} />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传播放图</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
              
              <div className="upload-col">
                <Form.Item
                  label="视频 (选填)"
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleVideoUpload}
                    accept="video/*"
                    customRequest={({ file, onSuccess, onError }) => {
                      uploadImageToCloud(file)
                        .then(res => {
                          if (res.success) {
                            onSuccess({ fileUrl: res.fileUrl });
                          } else {
                            onError(res.error || '上传失败');
                          }
                        })
                        .catch(err => onError(err));
                    }}
                  >
                    {uploadFiles.videoUrl ? (
                      <div className="video-uploaded">
                        <div>视频已上传</div>
                      </div>
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传视频</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
            
            <div className="upload-row">
              <div className="upload-col">
                <Form.Item
                  label="动画图 (选填)"
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleAnimatedUpload}
                    customRequest={({ file, onSuccess, onError }) => {
                      uploadImageToCloud(file)
                        .then(res => {
                          if (res.success) {
                            onSuccess({ fileUrl: res.fileUrl });
                          } else {
                            onError(res.error || '上传失败');
                          }
                        })
                        .catch(err => onError(err));
                    }}
                  >
                    {uploadFiles.animatedUrl ? (
                      <img src={uploadFiles.animatedUrl} alt="动画图" style={{ width: '100%' }} />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传动画图</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <Button onClick={closeModal}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              disabled={!uploadFiles.largeUrl || !uploadFiles.thumbnailUrl || !uploadFiles.playUrl}
            >
              {editingImage ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ImageLibrary; 