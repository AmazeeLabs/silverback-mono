declare const Timestamp: unique symbol;
export type Timestamp = string & {
  _opaque: typeof Timestamp;
};

export function timestamp(input: Timestamp) {
  return new Date(input);
}
