import 'reflect-metadata';

export function Query() {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const existingBodyIndices =
      Reflect.getMetadata('query_indices', target, propertyKey!) || [];
    existingBodyIndices.push(parameterIndex);
    Reflect.defineMetadata(
      'query_indices',
      existingBodyIndices,
      target,
      propertyKey!
    );
  };
}
