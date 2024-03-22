import type { AuthenticationBackendInterface } from './handler.js';

/**
 * Abstract email backend to send login links.
 *
 * Allows to restrict access to specific addresses or domains.
 */
export abstract class EmailBackend
  implements AuthenticationBackendInterface<{ id: string; name: string }>
{
  constructor(
    protected users: Record<string, string>,
    protected from: string,
  ) {}

  async getInfo(id: string): Promise<{ id: string; name: string } | undefined> {
    if (!id) {
      return;
    }
    if (id && this.users[id]) {
      return { id, name: this.users[id] };
    }

    if (id.split('@').length > 2) {
      return;
    }

    const [name, host] = id.split('@');
    if (name.includes('@')) {
      return;
    }

    const wildcard = `*@${host}`;
    if (this.users[wildcard]) {
      return { id, name };
    }
  }

  async deliver(id: string, link: string): Promise<void> {
    const info = await this.getInfo(id);
    if (info) {
      try {
        await this.sendEmail(id, info.name, link);
      } catch (error) {
        console.error(`Failed to send email to ${id}: ${error}`);
      }
    } else {
      console.error(`Failed to get info for ${id}`);
    }
  }

  abstract sendEmail(to: string, name: string, link: string): Promise<void>;
}

/**
 * Postmark email backend to send login links.
 *
 * Sends login links via the Postmark API, using postmark templates.
 * Passes the "name", "host" and "link" properties into the template.
 */
export class PostmarkEmailBackend extends EmailBackend {
  constructor(
    users: Record<string, string>,
    from: string,
    protected token: string,
    protected template: string,
  ) {
    super(users, from);
  }

  async sendEmail(to: string, name: string, link: string) {
    const result = await fetch(
      'https://api.postmarkapp.com/email/withTemplate',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.token,
        },
        body: JSON.stringify({
          From: this.from,
          To: to,
          TemplateAlias: this.template,
          TemplateModel: {
            name,
            link,
            host: new URL(link).hostname,
          },
        }),
      },
    );
    if (!result.ok) {
      throw new Error(`Failed to send email to ${to}`);
    }
  }
}

/**
 * Email backend for testing purposes.
 *
 * Logs the email to the console and stores the latest link. To be retrieved
 * programmatically by integration tests.
 */
export class TestEmailBackend extends EmailBackend {
  protected latestLink: string = '';
  async sendEmail(to: string, name: string, link: string) {
    this.latestLink = link;
    console.log(`Login link for ${name} (${to}): ${link}`);
  }
  getLatestLink() {
    return this.latestLink;
  }
}
