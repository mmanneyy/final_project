import { useAuth } from '@/hooks/useAuth';
import AuthPage from './AuthPage';
import MainApp from './MainApp';

const Index = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainApp /> : <AuthPage />;
};

export default Index;
