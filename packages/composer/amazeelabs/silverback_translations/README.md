# Silverback translations

The silverback translations module allows the creation of string translation
sources via an API endpoint where a POST request with JSON formatted data is
allowed.

The endpoint is */translations/create/{context}* and can be used to create
sources in a specific context (for example */translations/create/gatsby* to
create sources in the *gatsby* context).

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
so it is a string that can be generated with the [formatjs](https://formatjs.io/) library. Each nested object in the JSON represent a source string. The *defaultMessage* property will be used as the source string label and the *description* property will be appended to the context of the string.

## Endpoint access
The request must be a POST request, done with an user which has the 'access create translation sources endpoint' permissions. The basic auth method can be used to authenticate the request.
