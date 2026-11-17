import { BrowserRouter } from 'react-router-dom';
import { HOME_PATH } from '../../shared/auth';
import { ErrorBoundary } from '../../shared/ErrorBoundary';
import { App } from './App';
import './index.css';

export default function Root() {
  return (
    <ErrorBoundary homeHref={HOME_PATH}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
