import { lazy, Suspense } from 'react';
import { HomePage } from './components/HomePage';

const ArticlesPage = lazy(() =>
  import('./components/ArticlesPage').then((module) => ({
    default: module.ArticlesPage,
  })),
);

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

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/articles') {
    return (
      <Suspense fallback={null}>
        <ArticlesPage />
      </Suspense>
    );
  }

  return <HomePage />;
}
