!/usr/env bash
set -e
source .envrc
set -x

cd web

DIR=modules/custom/silverback_gatsby_test/content

rm -rf "$DIR"
mkdir "$DIR"

drush dcer node --folder="$DIR"
drush dcer taxonomy_term --folder="$DIR"
drush dcer media --folder="$DIR"
drush dcer user --folder="$DIR"

# Only leave the GatsbyPreview user.
grep -L GatsbyPreview $DIR/user/*.* | xargs rm

# Fix passwords.
# https://www.drupal.org/project/default_content/issues/2943458#comment-14022041
for file in $(find "$DIR/user" -type f)
do
    sed 's/pre_hashed: false/pre_hashed: true/g' "$file" > temp.txt && mv temp.txt "$file"
done
