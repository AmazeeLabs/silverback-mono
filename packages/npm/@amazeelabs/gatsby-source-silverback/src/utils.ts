export type Options = {
  // The internal url of the Drupal installation, used to fetch data.
  drupal_url: string;
  // The external url of the Drupal installation, used to set the x-forwarded headers.
  drupal_external_url?: string;
  // The Drupal GraphQL server path.
  graphql_path: string;
  // Optional Basic Auth Drupal user.
  auth_user?: string;
  // Optional Basic Auth Drupal password.
  auth_pass?: string;
};

export const validOptions = (options: {
  [key: string]: any;
}): options is Options => options.drupal_url && options.graphql_path;

export const apiUrl = (options: Options) =>
  `${new URL(options.drupal_url).origin}${options.graphql_path}`;
