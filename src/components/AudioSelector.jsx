import React, { useState, useEffect } from 'react';
import { Modal, Button, List, Avatar, Spin, Empty, message } from 'antd';
import { CustomerServiceOutlined, CheckCircleFilled } from '@ant-design/icons';
import { getAudios } from '../api/audioApi';
import '../styles/audioSelector.scss';

const AudioSelector = ({ visible, onCancel, onSelect, title = '选择音频' }) => {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);

  // 获取音频列表
  const fetchAudios = async () => {
    setLoading(true);
    try {
      const result = await getAudios();
      if (result.success) {
        setAudios(result.data);
      } else {
        message.error(result.error || '获取音频列表失败');
      }
    } catch (error) {
      console.error('获取音频列表失败:', error);
      message.error('获取音频列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载或弹窗显示时获取音频列表
  useEffect(() => {
    if (visible) {
      fetchAudios();
      setSelectedAudio(null); // 重置选中状态
    }
  }, [visible]);

  // 处理音频选择
  const handleAudioClick = (audio) => {
    setSelectedAudio(audio);
  };

  // 处理确认选择
  const handleConfirm = () => {
    if (selectedAudio) {
      onSelect(selectedAudio);
      onCancel();
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
          disabled={!selectedAudio}
        >
          确定
        </Button>
      ]}
    >
      <Spin spinning={loading}>
        <div className="audio-selector-container">
          {audios.length > 0 ? (
            <List
              className="audio-list"
              itemLayout="horizontal"
              dataSource={audios}
              renderItem={audio => (
                <List.Item
                  className={`audio-item ${selectedAudio?._id === audio._id ? 'selected' : ''}`}
                  onClick={() => handleAudioClick(audio)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<CustomerServiceOutlined />} />}
                    title={audio.name}
                    description={
                      <audio src={audio.url} controls />
                    }
                  />
                  {selectedAudio?._id === audio._id && (
                    <div className="selected-icon">
                      <CheckCircleFilled />
                    </div>
                  )}
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无音频" />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default AudioSelector; 