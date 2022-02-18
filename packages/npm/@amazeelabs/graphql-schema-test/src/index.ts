import axios from 'axios';
import fs from 'fs';
import _ from 'lodash';

require('jest-specific-snapshot');
const addSerializer = require('jest-specific-snapshot').addSerializer;

export const listFiles = (
  queriesDirPath: string,
): Array<
  [
    /** Path relative to queriesDirPath. */
    string,
    /** Absolute path. */
    string,
  ]
> => {
  return walk(queriesDirPath).map((fullPath) => [
    fullPath.substring(queriesDirPath.length + 1),
    fullPath,
  ]);
};

export const createExecutor = (
  graphqlConfigPath: string,
  serializer?: (responses: object) => object,
): ((queryPath: string) => Promise<void>) => {
  addSerializer({
    serialize(responses: object) {
      const processed = processData(responses);
      if (serializer) {
        serializer(processed);
      }
      return JSON.stringify(combine(processed), null, 2);
    },
    test: () => true,
  });

  const endpoints: Record<
    string,
    { url: string; headers: Record<string, string> }
  > = JSON.parse(fs.readFileSync(graphqlConfigPath, 'utf8')).extensions
    .endpoints;

  return async (queryPath: string) => {
    const results = Object.fromEntries(
      await Promise.all(
        Object.entries(endpoints).map(async ([name, endpoint]) => {
          const res = await axios.post(
            endpoint.url,
            { query: fs.readFileSync(queryPath).toString() },
            {
              headers: endpoint.headers,
              validateStatus: null,
            },
          );
          return [
            name,
            {
              code: res.status,
              data: res.data,
            },
          ];
        }),
      ),
    );
    expect(results).toMatchSpecificSnapshot(
      // We can't use `.snap` extension as it conflicts with Jest's default
      // snapshots.
      `${queryPath}.snapshot`,
    );
  };
};

function processData(responses: any) {
  let processed = responses;

  // Replace Drupal's numeric IDs with "[numeric]" placeholder.
  const processIds = (value: any) => {
    return _.transform(value, (result, value, key) => {
      // Silverback Gatsby numeric IDs.
      if (
        key === 'id' &&
        _.isString(value) &&
        value.match(/^[0-9]+(:[^:]+)?$/)
      ) {
        // @ts-ignore
        result[key] = value.replace(/^([0-9]+)(:[^:]+)?$/, '[numeric]$2');
      }
      // Silverback Gatsby numeric IDs.
      else if (
        key === 'drupalId' &&
        _.isString(value) &&
        value.match(/^[0-9]+$/)
      ) {
        // @ts-ignore
        result[key] = '[numeric]';
      }
      // Drupal internal paths.
      else if (
        key === 'path' &&
        _.isString(value) &&
        value.match(/^.*\/[0-9]+$/)
      ) {
        // @ts-ignore
        result[key] = value.replace(/^(.*\/)[0-9]+$/, '$1[numeric]');
      }
      // "data-id" attributes in Gutenberg links.
      else if (_.isString(value) && value.match(/<a.*\sdata-id="\d+"/)) {
        // @ts-ignore
        result[key] = value.replace(
          /(<a.*\s)data-id="\d+"/g,
          '$1data-id="[numeric]"',
        );
      } else {
        if (_.isArray(value) || _.isObject(value)) {
          // @ts-ignore
          result[key] = processIds(value);
        } else {
          // @ts-ignore
          result[key] = value;
        }
      }
    });
  };
  processed = processIds(processed);

  // Get rid of "locations" and "extensions" in "errors".
  Object.keys(processed).forEach((key) => {
    if (
      _.has(processed[key], 'data.errors') &&
      _.isArray(processed[key].data.errors)
    ) {
      for (const value of processed[key].data.errors) {
        if (_.has(value, 'locations')) {
          delete value.locations;
        }
        if (_.has(value, 'extensions')) {
          delete value.extensions;
        }
      }
    }
  });

  return processed;
}

// Can't use zx.glob because it's async and tests must be defined synchronously.
// Function from https://stackoverflow.com/a/16684530/580371
function walk(dir: string) {
  let results: Array<string> = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.gql')) {
        // List only .gql files.
        results.push(file);
      }
    }
  });
  return results;
}

/**
 * If responses are same, we combine them together.
 *
 * So instead of
 *   {
 *     "First endpoint": {
 *       "code": 200,
 *       "data": { "field": "same" }
 *     },
 *     "Second endpoint": {
 *       "code": 200,
 *       "data": { "field": "same" }
 *     }
 *   }
 * we get
 *   {
 *     "First endpoint & Second endpoint": {
 *       "code": 200,
 *       "data": { "field": "same" }
 *     }
 *   }
 */
function combine(responses: any): any {
  if (
    responses === null ||
    typeof responses !== 'object' ||
    Array.isArray(responses)
  ) {
    return responses;
  }
  const map: Array<{ keys: Array<String>; json: string; raw: any }> = [];
  Object.keys(responses).map((key) => {
    const json = JSON.stringify(responses[key]);
    const item = map.find((item) => item.json === json);
    if (item) {
      item.keys.push(key);
    } else {
      map.push({
        keys: [key],
        json,
        raw: responses[key],
      });
      return;
    }
  });
  const processed: any = {};
  map.map((item) => {
    processed[item.keys.join(' & ')] = item.raw;
  });
  return processed;
}
