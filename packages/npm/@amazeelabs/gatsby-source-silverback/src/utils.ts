export type Options = {
  // The internal url of the Drupal installation, used to fetch data.
  drupal_url?: string;
  // The external url of the Drupal installation, used to set the x-forwarded headers.
  drupal_external_url?: string;
  // The Drupal GraphQL server path.
  graphql_path?: string;
  // Optional Basic Auth user.
  auth_user?: string;
  // Optional Basic Auth password.
  auth_pass?: string;
  // Optional Key Auth.
  auth_key?: string;
  // How many GraphQL queries can be executed in parallel. Defaults to 10.
  query_concurrency?: number;
  // How many entities to fetch in a single GraphQL query. Defaults to 100.
  paginator_page_size?: number;
  // The prefix to use for all Gatsby node types. Defaults to "Drupal".
  type_prefix?: string;
  // Path to a graphql schema configuration file.
  schema_configuration?: string;
  // A dictionary of resolver functions that will be available as directvies.
  directives?: Record<string, Function>;
  // A list of functions that will be available as data source.
  sources?: Record<string, Function>;
  // A list of functions that will be available as data source or directive.
  autoload?: Record<string, Function>;
};

export const validOptions = (options: {
  [key: string]: any;
}): options is Options => true;

export const typePrefix = (options: Options) =>
  typeof options.type_prefix === 'string' ? options.type_prefix : 'Drupal';
