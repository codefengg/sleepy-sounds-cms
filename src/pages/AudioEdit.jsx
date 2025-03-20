import React, { useEffect } from 'react';
import { Card, Typography } from 'antd';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const AudioEdit = () => {
  const { id } = useParams();
  
  return (
    <div>
      <Title level={2}>{id ? '编辑音频' : '添加音频'}</Title>
      <Card>
        <p>这里是音频{id ? '编辑' : '添加'}表单，目前为简化版本。</p>
        {id && <p>正在编辑ID: {id}</p>}
      </Card>
    </div>
  );
};

export default AudioEdit; 