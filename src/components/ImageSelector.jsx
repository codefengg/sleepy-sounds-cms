import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Empty, Table, message, Image } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { getImages } from '../api/imageApi';
import '../styles/imageSelector.scss';

const ImageSelector = ({ visible, onCancel, onSelect, title = '选择图片' }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // 获取图片列表
  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 }; // 获取较多图片
      
      const result = await getImages(params);
      if (result.success) {
        setImages(result.data);
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

  // 组件挂载或弹窗显示时获取图片列表
  useEffect(() => {
    if (visible) {
      fetchImages();
      setSelectedImage(null); // 重置选中状态
    }
  }, [visible]);

  // 处理图片选择
  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  // 处理确认选择
  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    } else {
      message.warning('请选择一套图片');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '大图',
      dataIndex: 'largeUrl',
      key: 'largeUrl',
      render: (url) => (
        <div className="image-thumbnail">
          <Image src={url} alt="大图" width={80} height={80} />
        </div>
      ),
    },
    {
      title: '缩略图',
      dataIndex: 'thumbnailUrl',
      key: 'thumbnailUrl',
      render: (url) => (
        <div className="image-thumbnail">
          <Image src={url} alt="缩略图" width={80} height={80} />
        </div>
      ),
    },
    {
      title: '播放图',
      dataIndex: 'playUrl',
      key: 'playUrl',
      render: (url) => (
        <div className="image-thumbnail">
          <Image src={url} alt="播放图" width={80} height={80} />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleConfirm}
          disabled={!selectedImage}
        >
          确定
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <div className="image-selector-container">
          {images.length > 0 ? (
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={images}
              pagination={{ pageSize: 5 }}
              rowSelection={{
                type: 'radio',
                selectedRowKeys: selectedImage ? [selectedImage._id] : [],
                onChange: (_, selectedRows) => {
                  if (selectedRows.length > 0) {
                    setSelectedImage(selectedRows[0]);
                  } else {
                    setSelectedImage(null);
                  }
                }
              }}
              onRow={(record) => ({
                onClick: () => handleImageSelect(record),
              })}
            />
          ) : (
            <Empty description="暂无图片" />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default ImageSelector; 