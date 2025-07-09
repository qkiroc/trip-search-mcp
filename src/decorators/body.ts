import 'reflect-metadata';

export interface BodyParams {
  clientId: string;
  conversationId: string;
}

export function Body() {
  return function (
    target: any,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const existingBodyIndices =
      Reflect.getMetadata('body_indices', target, propertyKey!) || [];
    existingBodyIndices.push(parameterIndex);
    Reflect.defineMetadata(
      'body_indices',
      existingBodyIndices,
      target,
      propertyKey!
    );
  };
}
