import { ADMIN_HOME_PATH } from '../../shared/auth';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { App } from './App';
import './index.css';

export default function Root() {
  return (
    <ErrorBoundary homeHref={ADMIN_HOME_PATH}>
      <App />
    </ErrorBoundary>
  );
}
