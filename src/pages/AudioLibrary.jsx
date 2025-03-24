import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Upload, Modal, Input, Form, 
  message, Popconfirm, Space, Typography, Spin, 
  Row, Col, Empty, Pagination, List, Avatar
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, 
  UploadOutlined, CustomerServiceOutlined 
} from '@ant-design/icons';
import { getAudios, addAudio, deleteAudio, uploadAudioToCloud } from '../api/audioApi';
import '../styles/audioLibrary.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AudioLibrary = () => {
  // 状态
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);

  // 获取音频列表
  const fetchAudios = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        skip: (page - 1) * pageSize
      };
      
      const result = await getAudios(params);
      if (result.success) {
        setAudios(result.data);
        setPagination({
          current: page,
          pageSize,
          total: result.total
        });
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

  // 组件挂载时获取音频列表
  useEffect(() => {
    fetchAudios(pagination.current, pagination.pageSize);
  }, []);

  // 处理分页变化
  const handlePageChange = (page, pageSize) => {
    fetchAudios(page, pageSize);
  };

  // 打开上传音频弹窗
  const showUploadModal = () => {
    form.resetFields();
    setSelectedFile(null);
    setUploadModalVisible(true);
  };

  // 关闭上传音频弹窗
  const closeUploadModal = () => {
    setUploadModalVisible(false);
  };

  // 处理文件选择和上传
  const handleFileChange = async (info) => {
    if (info.file) {
      // 验证文件类型
      const isAudio = info.file.type.startsWith('audio/');
      if (!isAudio) {
        message.error('只能上传音频文件!');
        return;
      }
      
      setSelectedFile(info.file);
      // 自动填充文件名
      form.setFieldsValue({
        name: info.file.name.split('.')[0]
      });

      // 立即开始上传
      setUploadLoading(true);
      try {
        const uploadResult = await uploadAudioToCloud(info.file);
        if (uploadResult.success) {
          setUploadedFileUrl(uploadResult.fileUrl);
          message.success('音频上传成功');
        } else {
          throw new Error(uploadResult.error || '上传失败');
        }
      } catch (error) {
        message.error('上传失败: ' + error.message);
        setSelectedFile(null);
        form.setFieldsValue({ name: '' });
      } finally {
        setUploadLoading(false);
      }
    }
  };

  // 处理音频删除
  const handleDelete = async (id) => {
    try {
      const result = await deleteAudio(id);
      if (result.success) {
        message.success('音频删除成功');
        // 重新获取音频列表
        fetchAudios(pagination.current, pagination.pageSize);
      } else {
        message.error(result.error || '删除音频失败');
      }
    } catch (error) {
      message.error('删除音频失败: ' + error.message);
    }
  };

  // 处理表单提交（添加音频记录）
  const handleSubmit = async (values) => {
    if (!uploadedFileUrl) {
      message.error('请先上传音频文件');
      return;
    }

    try {
      // 添加音频记录到数据库
      const result = await addAudio({
        url: uploadedFileUrl,
        name: values.name
      });

      if (result.success) {
        message.success('音频添加成功');
        closeUploadModal();
        fetchAudios();
      } else {
        throw new Error(result.message || '添加失败');
      }
    } catch (error) {
      message.error('添加失败: ' + error.message);
    }
  };

  return (
    <div className="audio-library-container">
      <div className="audio-library-header">
        <Title level={2}>音频库</Title>
        <Button 
          type="primary" 
          icon={<UploadOutlined />}
          onClick={showUploadModal}
        >
          上传音频
        </Button>
      </div>
      
      <Spin spinning={loading}>
        {audios.length > 0 ? (
          <List
            className="audio-list"
            itemLayout="horizontal"
            dataSource={audios}
            renderItem={audio => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="确定要删除这个音频吗?"
                    description="删除后无法恢复"
                    onConfirm={() => handleDelete(audio._id)}
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<CustomerServiceOutlined />} />}
                  title={audio.name}
                  description={
                    <audio src={audio.url} controls />
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无音频" />
        )}
        
        {pagination.total > 0 && (
          <div className="pagination-container">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `共 ${total} 个音频`}
            />
          </div>
        )}
      </Spin>
      
      {/* 上传音频弹窗 */}
      <Modal
        title="添加音频"
        open={uploadModalVisible}
        onCancel={closeUploadModal}
        footer={null}
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="选择音频">
            <Upload
              accept="audio/*"
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
              showUploadList={false}
            >
              <Button 
                icon={<UploadOutlined />} 
                loading={uploadLoading}
              >
                选择音频文件
              </Button>
            </Upload>
            {uploadedFileUrl && (
              <div style={{ marginTop: 8 }}>
                <audio src={uploadedFileUrl} controls />
              </div>
            )}
          </Form.Item>
          
          <Form.Item
            name="name"
            label="音频名称"
            rules={[{ required: true, message: '请输入音频名称' }]}
          >
            <Input placeholder="请输入音频名称" />
          </Form.Item>
          
          <Form.Item className="form-actions">
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeUploadModal}>
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!uploadedFileUrl}
              >
                添加
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AudioLibrary; 