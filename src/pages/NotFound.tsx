import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/dashboard')}
            style={{ backgroundColor: '#722F37' }}
          >
            返回首页
          </Button>
        }
      />
    </div>
  );
}
