export function pluck<T, K extends keyof T>(...properties: K[]) {
  return new TransformStream<T, T[K]>({
    transform(chunk, controller) {
      let value: any = chunk;
      for (const prop of properties) {
        value = value?.[prop];
        if (value === undefined) {
          return;
        }
      }
      controller.enqueue(value);
    }
  });
} 