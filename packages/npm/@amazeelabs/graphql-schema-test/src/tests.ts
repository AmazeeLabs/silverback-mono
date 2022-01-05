import axios from 'axios';
import _ from 'lodash';
import { fs, path } from 'zx';

require('jest-specific-snapshot');
const addSerializer = require('jest-specific-snapshot').addSerializer;

const folder = process.env.FOLDER!;

addSerializer({
  serialize(responses: object) {
    let processed = processData(responses);
    const serializerPath = path.resolve(folder, 'serializer.js');
    if (fs.existsSync(serializerPath)) {
      const serializer = require(serializerPath).default;
      processed = serializer(processed);
    }
    return JSON.stringify(processed, null, 2);
  },
  test: () => true,
});

const endpoints: Record<
  string,
  { url: string; headers: Record<string, string> }
> = JSON.parse(fs.readFileSync(path.resolve(folder, '.graphqlconfig'), 'utf8'))
  .extensions.endpoints;

const dir = path.resolve(folder, '__tests__');
const files = walk(dir).map((fullPath) => [
  fullPath.substring(dir.length + 1),
  fullPath,
]);

test.each(files)('%s', async (_, path) => {
  const results = Object.fromEntries(
    await Promise.all(
      Object.entries(endpoints).map(async ([name, endpoint]) => {
        const res = await axios.post(
          endpoint.url,
          { query: fs.readFileSync(path).toString() },
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
  expect(results).toMatchSpecificSnapshot(`${path}.snap`);
});

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

function processData(responses: any) {
  let processed = responses;

  // Replace Drupal's numeric IDs with "[numeric]" placeholder.
  const processIds = (value: any) => {
    return _.transform(value, (result, value, key) => {
      if (
        key === 'id' &&
        _.isString(value) &&
        value.match(/^[0-9]+(:[^:]+)?$/)
      ) {
        // @ts-ignore
        result[key] = value.replace(/^([0-9]+)(:[^:]+)?$/, '[numeric]$2');
      } else if (
        key === 'drupalId' &&
        _.isString(value) &&
        value.match(/^[0-9]+$/)
      ) {
        // @ts-ignore
        result[key] = '[numeric]';
      } else if (
        key === 'path' &&
        _.isString(value) &&
        value.match(/^.*\/[0-9]+$/)
      ) {
        // @ts-ignore
        result[key] = value.replace(/^(.*\/)[0-9]+$/, '$1[numeric]');
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
