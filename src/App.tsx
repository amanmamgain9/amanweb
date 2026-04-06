import { HomePage } from './components/HomePage';
import { RobotDebugPage } from './components/RobotDebugPage';
import { RobotVrmLoadPage } from './components/RobotVrmLoadPage';

export default function App() {
  const search = new URLSearchParams(window.location.search);
  if (search.get('robotStudio') === '1') {
    return <RobotDebugPage />;
  }
  if (search.get('vrmLoadTest') === '1') {
    return <RobotVrmLoadPage />;
  }
  return <HomePage />;
}
