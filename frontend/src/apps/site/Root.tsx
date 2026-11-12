import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
