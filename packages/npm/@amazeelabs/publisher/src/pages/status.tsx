import React from 'react';
import ReactDOM from 'react-dom';

import Status from '../components/Status';
import {useStatus} from "../utils/status";

function StatusPage() {
  const {gateway} = useStatus();
  return <Status gateway={gateway}/>;
}

ReactDOM.render(
  <React.StrictMode>
    <StatusPage />
  </React.StrictMode>,
  document.getElementById('root'),
);
