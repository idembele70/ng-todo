export interface Todo {
  readonly id: number;
  title: string;
  complete: 0 | 1;
  readonly createdAt: string;
}
