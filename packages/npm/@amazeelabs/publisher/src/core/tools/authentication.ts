import { NextFunction, Request, RequestHandler, Response } from 'express';

import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';
import basicAuth from 'express-basic-auth';
import { getConfig, OAuth2GrantTypes } from './config';
import fetch from 'node-fetch';

/**
 * Middleware to handle OAuth2 challenge.
 *
 * Displays a challenge to the user to enter a username and password
 * to get an access token and authenticate to Publisher.
 */
const oAuth2ChallengeMiddleware: RequestHandler = ((): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const oAuth2Config = getConfig().oAuth2;
    if (!oAuth2Config) {
      res.status(500).send('Missing OAuth2 configuration.');
    }

    const oAuth2ModuleOptions: ModuleOptions = {
      client: {
        id: oAuth2Config?.clientId || '',
        secret: oAuth2Config?.clientSecret || '',
      },
      auth: {
        tokenHost: oAuth2Config?.tokenHost || '',
        tokenPath: oAuth2Config?.tokenPath || '',
      },
    };

    // As an MVP, we are using the www-authenticate header to send the challenge.
    // This allows to have a lightweight implementation of the UI, and we
    // don't need to handle any session.

    // Further implementation can add
    // - Refresh token support.
    // - Session management.
    // - Dedicated UI for the challenge, or better, with AuthorizationCode grant type,
    // a redirect to the Drupal login, then redirect back to the app (SSO like).
    // So we don't need to rely on the www-authenticate header
    // and the password ResourceOwnerPassword grant type.
    const base64Auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [wwwLogin, wwwPassword] = Buffer.from(base64Auth, 'base64')
      .toString()
      .split(':');

    // Grant type: password.
    const oAuth2Client = new ResourceOwnerPassword(oAuth2ModuleOptions);
    let errorMessage: string | null = null;

    if (wwwLogin && wwwPassword) {
      const tokenParams = {
        username: wwwLogin,
        password: wwwPassword,
        scope: 'publisher',
      };

      try {
        console.log('Trying to get the Access Token...');
        const accessToken = await oAuth2Client.getToken(tokenParams);
        if (accessToken) {
          console.log('Access Token retrieved.');
          const publisherAuthentication = await fetch(
            `${oAuth2ModuleOptions.auth.tokenHost}/publisher/authenticate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken.token.access_token}`,
              },
            },
          );

          if (publisherAuthentication.status === 200) {
            console.log('Publisher authentication succeeded.');
            return next();
          } else if (
            publisherAuthentication.status === 403 ||
            publisherAuthentication.status === 401
          ) {
            errorMessage = 'Publisher authentication failed.';
          } else if (publisherAuthentication.status === 500) {
            errorMessage = 'Internal server error.';
          } else {
            errorMessage = 'Unknown error.';
          }
        }
      } catch (data) {
        errorMessage = 'OAuth2 authentication failed.';
      }
    }

    res.set('WWW-Authenticate', 'Basic realm="401"');
    if (errorMessage) {
      console.error(errorMessage);
      res.status(401).send(errorMessage);
    } else {
      res.status(401).send('Authentication required.');
    }
  };
})();

/**
 * Returns the Express authentication middleware based on the configuration.
 *
 * Favours OAuth2, then Basic Auth, then falling back to no auth
 * if not configured (= grant access).
 */
export const getAuthenticationMiddleware: RequestHandler =
  ((): RequestHandler => {
    const oAuth2Config = getConfig().oAuth2;
    if (oAuth2Config) {
      if (oAuth2Config.grantType === OAuth2GrantTypes.ResourceOwnerPassword) {
        return oAuth2ChallengeMiddleware;
      } else {
        console.error(
          'Only the ResourceOwnerPassword grant type is currently supported.',
        );
      }
    }

    const basicAuthConfig = getConfig().basicAuth;
    if (basicAuthConfig) {
      return basicAuth({
        users: { [basicAuthConfig.username]: basicAuthConfig.password },
        challenge: true,
      });
    }

    return (req: Request, res: Response, next: NextFunction): void => next();
  })();
