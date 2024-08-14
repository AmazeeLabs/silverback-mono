import React from 'react';

import { Image } from '../../../src/client.js';
import { ClientImageSettings } from '../client-settings';

export default function Index() {
  return (
    <ClientImageSettings>
      <h2>No transformation</h2>
      <Image src="/goats.jpg" width={500} />
      <h2>Scale width</h2>
      <Image src="/goats.jpg" width={200} />
      <h2>Crop</h2>
      <Image src="/goats.jpg" width={200} height={200} />
      <h2>Portrait without focus</h2>
      <Image src="/goats.jpg" width={150} height={300} />
      <h2>Portrait with manual focus</h2>
      <Image src="/goats.jpg" width={150} height={300} focus={[380, 180]} />
      <h2>Landscape without focus</h2>
      <Image src="/goats.jpg" width={300} height={100} />
      <h2>Landscape with manual focus</h2>
      <Image src="/goats.jpg" width={300} height={100} focus={[380, 140]} />
      <h2>Remote file</h2>
      <Image src="http://localhost:9999/goats.jpg" width={500} />
    </ClientImageSettings>
  );
}
