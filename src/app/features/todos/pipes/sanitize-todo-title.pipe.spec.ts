import { SanitizeTodoTitlePipe } from './sanitize-todo-title.pipe';

describe('SanitizeTodoTitlePipe', () => {
  it('create an instance', () => {
    const pipe = new SanitizeTodoTitlePipe();
    expect(pipe).toBeTruthy();
  });
});
