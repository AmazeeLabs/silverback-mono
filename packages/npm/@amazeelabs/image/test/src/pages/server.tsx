import { Image, ImageSettings } from '../../../src/server.js';

export default function Index() {
  return (
    <ImageSettings
      outputDir="dist/public/images"
      outputPath="/images"
      alterSrc={(src) => src.replace('9999', '8889')}
    >
      <h2>Scale width</h2>
      <Image src="/goats.jpg" width={200} />
      <h2>Crop</h2>
      <Image src="/goats.jpg" width={200} height={200} />
      <h2>Portrait with automatic focus</h2>
      <Image src="/goats.jpg" width={150} height={300} />
      <h2>Portrait with manual focus</h2>
      <Image
        src="/goats.jpg"
        width={150}
        height={300}
        focalPoint={[380, 180]}
      />
      <h2>Landscape with automatic focus</h2>
      <Image src="/goats.jpg" width={300} height={100} />
      <h2>Landscape with manual focus</h2>
      <Image
        src="/goats.jpg"
        width={300}
        height={100}
        focalPoint={[380, 140]}
      />
      <h2>Remote file</h2>
      <Image src="http://localhost:9999/goats.jpg" width={500} />
    </ImageSettings>
  );
}
