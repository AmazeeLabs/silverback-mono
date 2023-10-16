import React from 'react';
import ReactDOM from 'react-dom/client';

import Status from '../components/Status';
import { useStatus } from '../utils/status';

function StatusPage() {
  const status = useStatus();
  return <Status status={status} />;
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <StatusPage />
  </React.StrictMode>,
);
