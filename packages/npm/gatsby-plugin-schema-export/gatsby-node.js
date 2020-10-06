const fs = require("fs");
const path = require("path");
const {
  introspectionQuery,
  graphql,
  buildClientSchema,
  printSchema,
} = require("gatsby/graphql");

const defaultLocation = path.resolve(process.cwd(), "schema.gql");

module.exports.onPostBootstrap = ({ store }, options) => {
  const dest = options.dest || defaultLocation;
  new Promise((resolve, reject) => {
    const { schema } = store.getState();
    graphql(schema, introspectionQuery)
      .then((res) => {
        fs.writeFileSync(dest, printSchema(buildClientSchema(res.data)));
        return undefined;
      })
      .then(() => {
        console.log(`[gatsby-plugin-schema-export] Exported schema to ${dest}`);
        return resolve();
      })
      .catch((e) => {
        console.error(
          `[gatsby-plugin-schema-export] Failed to export schema: ${e}`,
          e
        );
        reject();
      });
  });
};
