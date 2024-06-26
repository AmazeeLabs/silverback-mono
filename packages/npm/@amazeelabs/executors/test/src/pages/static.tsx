import { Add } from '../add-server.js';

export default function Static() {
  return <Add label="Static" />;
}

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
