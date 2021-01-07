> This project is maintained in the [silverback monorepo](https://github.com/AmazeeLabs/silverback-mono)
# Silverback CLI

`amazeelabs/silverback-cli` is a composer package adding tooling and configuration scaffolding to Amazee Drupal projects.

Killer features:
- 🚀 Install Drupal in seconds.
- 📸 Create/restore Drupal state snapshots instantly.

## Installation

**Important:** Make sure your project is already under a version control system. Otherwise, it will be a mess.

1. Make sure you have [all dependencies](https://github.com/AmazeeLabs/silverback-mono#requirements) installed. `direnv` is an important one.
1. Add `amazeelabs/silverback-cli` to `allowed-packages` in `composer.json`. It should be the last one in the list. Example:
   ```
   "extra": {
     "drupal-scaffold": {
       "allowed-packages": [
         "amazeeio/drupal-integrations",
         "amazeelabs/silverback-cli"
       ]
     }
   }
   ```
1. Make sure `sites/default/settings.php` exists. If it does not, copy it from `sites/default/default.settings.php`.
1. Run
   ```
   composer require amazeelabs/silverback-cli
   direnv allow
   ```
1. Check the VCS changes.

## Usage

```sh
# To quick-start Drupal:
silverback setup
drush serve

# To see other use cases:
silverback list
silverback help [command_name]
```

## How it works

Silverback makes Drupal use an SQLite database in local environment. The database is located in the Drupal files directory. This means that the whole Drupal state is stored in a single directory.

Silverback puts this directory into `install-cache.zip` and reuses it the next time `silverback setup` is fired.

Snapshots work in the same way. They are just copies of the Drupal files directory.
