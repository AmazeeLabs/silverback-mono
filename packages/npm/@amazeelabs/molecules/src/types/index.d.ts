const src: string;
const width: number;
const height: number;
const format: 'webp' | 'jpeg';

declare module '*&metadata' {
  export = { src, width, height, format };
}

declare module '*?metadata' {
  export = { src, width, height, format };
}
