import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AccueilDashboard from './AccueilDashboard.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AccueilDashboard />
  </StrictMode>
);
