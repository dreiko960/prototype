export interface Prototype<T> {
  cloneShallow(): T;
  cloneDeep(): T;
}
