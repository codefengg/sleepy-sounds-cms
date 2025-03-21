import React, { useState, useEffect } from 'react';
import { Modal, Button, Spin, Empty, Tabs, message } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { getImages } from '../api/imageApi';
import Masonry from 'react-masonry-css';
import '../styles/imageSelector.scss';

const ImageSelector = ({ visible, onCancel, onSelect, title = '选择图片', imageType = null }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(imageType || 'all');

  // 瀑布流的断点设置
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  // 获取图片列表
  const fetchImages = async (type = null) => {
    setLoading(true);
    try {
      const params = { limit: 100 }; // 获取较多图片
      
      if (type && type !== 'all') {
        params.type = type;
      }
      
      const result = await getImages(params);
      if (result.success) {
        setImages(result.data);
        console.log('获取到图片数据:', result.data);
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

  // 组件挂载或弹窗显示时获取图片列表
  useEffect(() => {
    if (visible) {
      fetchImages(activeTab !== 'all' ? activeTab : null);
      setSelectedImage(null); // 重置选中状态
    }
  }, [visible, activeTab]);

  // 处理图片选择
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  // 处理标签切换
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // 处理确认选择
  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    } else {
      message.warning('请选择一张图片');
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      width={800}
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
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <Tabs.TabPane tab="全部" key="all" />
        <Tabs.TabPane tab="背景图" key="background" />
        <Tabs.TabPane tab="播放图标" key="playIcon" />
        <Tabs.TabPane tab="列表图" key="listImage" />
      </Tabs>
      
      <Spin spinning={loading}>
        <div className="image-selector-container">
          {images.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {images.map(image => (
                <div 
                  key={image._id} 
                  className={`image-item ${selectedImage?._id === image._id ? 'selected' : ''}`}
                  onClick={() => handleImageClick(image)}
                >
                  {selectedImage?._id === image._id && (
                    <div className="selected-icon">
                      <CheckCircleFilled />
                    </div>
                  )}
                  <div className="image-wrapper">
                    <img src={image.url} alt={image.name} />
                  </div>
                  <div className="image-name">{image.name}</div>
                </div>
              ))}
            </Masonry>
          ) : (
            <Empty description="暂无图片" />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default ImageSelector; 