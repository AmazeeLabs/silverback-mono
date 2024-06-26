import { Add } from '../add-client.js';

export default function Static() {
  return <Add />;
}

export const getConfig = async () => {
  return {
    render: 'static',
  };
};
