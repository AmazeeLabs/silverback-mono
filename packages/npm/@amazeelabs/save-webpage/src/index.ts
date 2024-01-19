import scrape from 'website-scraper';

export async function saveWebpage(args: {
  /**
   * URL of the target webpage.
   */
  url: string;
  /**
   * Replaces the actual webpage content.
   */
  content?: string;
  /**
   * Path to directory where downloaded files will be saved. Must not exist.
   */
  directory: string;
}): Promise<void> {
  await scrape({
    directory: args.directory,
    urls: [args.url],
    plugins: args.content ? [new ReplaceContentPlugin(args.content)] : [],
  });
}

// Replaces the first request response with given content.
class ReplaceContentPlugin {
  isFirstRequest = true;

  constructor(public firstRequestResponse: string) {}

  apply(
    registerAction: (
      event: 'afterResponse',
      handler: <T>(args: { response: T }) => Promise<
        | T
        | {
            body: string;
            encoding: 'utf8';
            metadata: {};
          }
      >,
    ) => void,
  ): void {
    registerAction('afterResponse', async ({ response }) => {
      if (this.isFirstRequest) {
        this.isFirstRequest = false;
        return {
          body: this.firstRequestResponse,
          encoding: 'utf8',
          metadata: {},
        };
      } else {
        this.isFirstRequest = false;
        return response;
      }
    });
  }
}
