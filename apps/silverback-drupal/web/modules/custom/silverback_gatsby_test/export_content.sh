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
drush dcer path_alias --folder="$DIR"
drush dcer user --folder="$DIR"

# Only leave the GatsbyPreview user.
grep -L GatsbyPreview "$DIR/user/*.*" | xargs rm
