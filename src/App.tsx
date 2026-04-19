import { lazy, Suspense } from 'react';
import { HomePage } from './components/HomePage';

const RobotVrmLoadPage = lazy(() =>
  import('./components/RobotVrmLoadPage').then((m) => ({
    default: m.RobotVrmLoadPage,
  })),
);

export default function App() {
  const search = new URLSearchParams(window.location.search);
  if (search.get('vrmLoadTest') === '1') {
    return (
      <Suspense fallback={null}>
        <RobotVrmLoadPage />
      </Suspense>
    );
  }
  return <HomePage />;
}
