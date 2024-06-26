export type OperationId<
  TQueryResult extends any,
  TQueryVariables extends any,
> = string & {
  ___query_result: TQueryResult;
  ___query_variables: TQueryVariables;
};

export type AnyOperationId = OperationId<any, any>;
// export type UnknownOperationId = OperationId<any, unknown>;

export type OperationResult<TQueryID extends OperationId<any, any>> =
  TQueryID['___query_result'];

export type OperationVariables<TQueryID extends OperationId<any, any>> =
  TQueryID['___query_variables'];
