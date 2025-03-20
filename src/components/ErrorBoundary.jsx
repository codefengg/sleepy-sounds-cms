import React from 'react';
import { Button, Result } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("错误信息:", error);
    console.error("错误调用栈:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="渲染出错"
          subTitle={`发生了一个错误: ${this.state.error?.message || '未知错误'}`}
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 