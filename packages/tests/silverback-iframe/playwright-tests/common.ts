import { Frame, PlaywrightTestArgs } from '@playwright/test';

export const getIframe = async (
  page: PlaywrightTestArgs['page'],
): Promise<Frame> => {
  await page.waitForSelector('iframe');
  const iframe = await page.$('iframe');
  if (!iframe) {
    throw new Error('Cannot get iframe.');
  }
  const frame = await iframe.contentFrame();
  if (!frame) {
    throw new Error("Cannot get iframe's content frame.");
  }
  return frame;
};
