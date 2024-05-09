# Silverback translations

The silverback translations module allows the creation of string translation
sources via an API endpoint where a POST request with JSON formatted data is
allowed.

The endpoint is _/translations/create/{context}_ and can be used to create
sources in a specific context (for example _/translations/create/gatsby_ to
create sources in the _gatsby_ context).

The format of the JSON string should be like that:

```
{
  "9a9+ww": {
    "defaultMessage": "Lorem ipsum dolor sit amet"
    "description": "Donec et nunc turpis"
  },
  "Qp1beM": {
    "defaultMessage": "Donec et nunc turpis. In mollis laoreet mi, eu interdum enim tempus sed."
  }
}
```

so it is a string that can be generated with the
[formatjs](https://formatjs.io/) library. Each nested object in the JSON
represent a source string. The _defaultMessage_ property will be used as the
source string label and the _description_ property will be appended to the
context of the string.

## Endpoint access

The request must be a POST request, done with an user which has the 'access
create translation sources endpoint' permissions. The basic auth method can be
used to authenticate the request.
