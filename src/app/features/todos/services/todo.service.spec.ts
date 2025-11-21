import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom, Subscription } from "rxjs";
import { TODO_API_PATHS, TODO_API_PATHS_TOKEN, TodoApiPaths } from "../config/todo-api-paths.config";
import { PaginatedTodos, PaginationInfo, Todo } from "../models/todo.model";
import { flushRefreshHasCompleted } from '../testing/todo.utility';
import { TodoCompletion } from './../models/todo.model';
import { TodoService } from "./todo.service";

describe('TodoService', () => {
  let httpMock: HttpTestingController;
  let service: TodoService;
  let apiPaths: TodoApiPaths;

  const mockTodo: Todo = {
    id: 1,
    title: 'Test todo',
    complete: TodoCompletion.UNCOMPLETED,
    createdAt: '1730000000',
  };
  const mockErrorResponse = { status: 500, statusText: 'An error occurred!' };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: TODO_API_PATHS_TOKEN,
          useValue: TODO_API_PATHS,
        },
        TodoService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TodoService);
    apiPaths = TestBed.inject(TODO_API_PATHS_TOKEN);
  });

  afterEach(() => {
    httpMock.verify();
  })

  describe('addTodo', () => {
    it('should add a todo', async () => {
      const newTodo = {
        title: 'New todo',
      } satisfies Partial<Todo>;
      const promise = firstValueFrom(service.addTodo(newTodo));
      const req = httpMock.expectOne(apiPaths.ADD_ONE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ todo: newTodo });
      req.flush({ todo: { ...mockTodo, ...newTodo } });
      const todo = await promise;
      expect(todo.title).toBe(newTodo.title);
    });

    it('should handle validation errors', async () => {
      const todo: Pick<Todo, 'title'> = {
        title: '',
      };
      const promise = firstValueFrom(service.addTodo(todo));
      const req = httpMock.expectOne(apiPaths.ADD_ONE);
      req.flush('Validation failed', mockErrorResponse);
      await expectAsync(promise).toBeRejectedWith(
        jasmine.objectContaining({
          status: 500,
        }),
      );
    });
  });

  describe('deleteOne', () => {
    let refreshTriggeredCount: number;
    let sub: Subscription;
    beforeEach(() => {
      refreshTriggeredCount = 0;
      sub = service.refreshChanges$.subscribe(() => refreshTriggeredCount++);
    });

    afterEach(() => {
      sub.unsubscribe();
    });

    it('should delete one and refresh hasCompleted + emit refreshChanges', async () => {
      const id = 1;
      const promise = firstValueFrom(service.deleteOneTodo(id));
      const req = httpMock.expectOne(apiPaths.DELETE_ONE + id);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(null);
      flushRefreshHasCompleted(
        httpMock,
        apiPaths.GET_HAS_COMPLETED,
        { totalItems: 0 }
      )
      await promise;
      expect(refreshTriggeredCount).toBe(1);
    });

    it('should handle delete error', async () => {
      const invalidId = 4587;
      const promise = firstValueFrom(service.deleteOneTodo(invalidId));
      const req = httpMock.expectOne(apiPaths.DELETE_ONE + invalidId);
      req.flush('Cannot delete', mockErrorResponse);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      await expectAsync(promise)
        .toBeRejectedWith(jasmine.objectContaining({
          status: 500,
        }));
      expect(refreshTriggeredCount).toBe(0);
    });
  });

  describe('deleteAllTodos', () => {
    let refreshChangesCount: number;
    let sub: Subscription;

    beforeEach(() => {
      refreshChangesCount = 0;
      sub = service.refreshChanges$.subscribe(() => refreshChangesCount++);
    });

    afterEach(() => {
      sub.unsubscribe();
    })
    it('should delete all todos and set hasCompleted to false + emit once refreshChanges', async () => {
      const promise = firstValueFrom(service.deleteAllTodos());
      const req = httpMock.expectOne(apiPaths.DELETE_ALL);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toBeNull();
      req.flush(null);
      await promise;
      expect(refreshChangesCount).toBe(1);
      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeFalse();
    })

    it('should handle remove all error', async () => {
      const promise = firstValueFrom(service.deleteAllTodos());
      const req = httpMock.expectOne(apiPaths.DELETE_ALL);
      req.flush('Cannot remove all', mockErrorResponse);
      await expectAsync(promise).toBeRejectedWith(
        jasmine.objectContaining({
          status: 500,
        }),
      );

      expect(refreshChangesCount).toBe(0);
      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeFalse();
    });
  });

  describe('deleteAllCompletedTodos', () => {
    let refreshChangesCount: number;
    let sub: Subscription;

    beforeEach(() => {
      refreshChangesCount = 0;
      service.setHasCompletedTodos(true);

      sub = service.refreshChanges$.subscribe(() => refreshChangesCount++);
    });

    afterEach(() => {
      sub.unsubscribe();
    });

    it('should delete completed todos and set hasCompleted to false + emit once refreshChanges', async () => {
      const promise = firstValueFrom(service.deleteAllCompletedTodos());
      const req = httpMock.expectOne(req =>
        req.url === apiPaths.DELETE_ALL_COMPLETED &&
        req.method === 'DELETE' &&
        req.params.get('complete') === String(TodoCompletion.COMPLETED)
      );
      expect(req.request.body).toBeNull();
      req.flush(null);
      await promise;
      expect(refreshChangesCount).toBe(1);
      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeFalse();
    });

    it('should handle clean all completed todos error', async () => {
      const promise = firstValueFrom(service.deleteAllCompletedTodos());
      const req = httpMock.expectOne(req =>
        req.url === apiPaths.DELETE_ALL_COMPLETED &&
        req.params.get('complete') === String(TodoCompletion.COMPLETED) &&
        req.method === 'DELETE'
      );
      req.flush('Cannot clean completed todos', mockErrorResponse);
      await expectAsync(promise).toBeRejectedWith(
        jasmine.objectContaining({
          status: 500,
        }),
      );

      expect(refreshChangesCount).toBe(0);
      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeTrue();
    });

  });

  describe('completeTodo', () => {
    it('should complete one todo and set refreshHasCompletedtodos to true', async () => {
      const id = 1;
      service.setHasCompletedTodos(false);
      const promise = firstValueFrom(service.completeTodo(id));
      const req = httpMock.expectOne(apiPaths.COMPLETE_ONE + id);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ complete: TodoCompletion.COMPLETED });
      req.flush({ todo: { ...mockTodo, complete: TodoCompletion.COMPLETED } });
      const todo = await promise;
      expect(todo.complete).toBe(TodoCompletion.COMPLETED);
      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeTrue();
    });
  });

  describe('uncompleteTodo', () => {
    it('should uncomplete one todo and trigger refreshHasCompletedTodos', async () => {
      const id = 1;
      const promise = firstValueFrom(service.uncompleteTodo(id));
      const req = httpMock.expectOne(apiPaths.UNCOMPLETE_ONE + id);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ complete: TodoCompletion.UNCOMPLETED });
      req.flush({ todo: { ...mockTodo, complete: TodoCompletion.UNCOMPLETED } });

      flushRefreshHasCompleted(
        httpMock,
        apiPaths.GET_HAS_COMPLETED,
        { totalItems: 0 },
      );

      const todo = await promise;
      expect(todo.complete).toBe(0);
    });
  });

  describe('editTodoTitle', () => {
    it('should edit existing todo title', async () => {
      let refreshChangeCount = 0;
      const sub = service.refreshChanges$.subscribe(() =>
        refreshChangeCount++
      );
      const update: Pick<Todo, 'title' | 'id'> = {
        id: 1,
        title: 'edited title'
      }
      const promise = firstValueFrom(service.editTodoTitle(update));
      const req = httpMock.expectOne(apiPaths.EDIT_TITLE + update.id);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ title: update.title });
      req.flush({ todo: { ...mockTodo, ...update } });
      const todo = await promise;
      expect(todo.title).toBe(update.title);
      expect(refreshChangeCount).toBe(1);
      sub.unsubscribe();
    })
  });

  describe('refreshTodos', () => {
    it('should refresh & update todos & pagination state', async () => {
      const mockPaginationInfo: PaginationInfo = {
        currentPage: 1,
        totalPages: 2,
        totalItems: 4,
      };
      const mockPaginatedTodos: PaginatedTodos = {
        ...mockPaginationInfo,
        todos: [
          mockTodo,
          { ...mockTodo, id: 2 },
        ]
      }
      const currentPage = 1;
      const promise = firstValueFrom(service.refreshTodos(currentPage));
      const req = httpMock.expectOne(req =>
        req.url === apiPaths.GET_ALL &&
        req.method === 'GET' &&
        req.params.get('page') === String(currentPage)
      );
      req.flush(mockPaginatedTodos);

      const response = await promise;
      expect(response.todos).toEqual(mockPaginatedTodos.todos);
      const paginationInfo = await firstValueFrom(service.paginationInfo$);
      expect(paginationInfo).toEqual(mockPaginationInfo);
    });

    it('should fallback to previous page if empty todos on a later page', async () => {
      const page = 2;
      const mockEmptyResponse = {
        currentPage: page,
        totalItems: 10,
        totalPages: 3,
        todos: []
      };
      const previousPage = page - 1;
      const mockPreviousPageResponse = {
        currentPage: previousPage,
        totalItems: 10,
        totalPages: 1,
        todos: []
      };

      const promise = firstValueFrom(service.refreshTodos(page));

      httpMock
        .expectOne(req =>
          req.url === apiPaths.GET_ALL &&
          req.method === 'GET' &&
          req.params.get('page') === String(page)
        )
        .flush(mockEmptyResponse);

      httpMock
        .expectOne(req =>
          req.url === apiPaths.GET_ALL &&
          req.method === 'GET' &&
          req.params.get('page') === String(previousPage)
        )
        .flush(mockPreviousPageResponse);

      const paginationInfo = await firstValueFrom(service.paginationInfo$)
      expect(mockPreviousPageResponse).toEqual(jasmine.objectContaining(paginationInfo));

      const response = await promise;
      expect(response).toEqual(mockPreviousPageResponse);
    })
  });

  describe('refreshCompletedTodos', () => {
    it('should set hasCompletedTodos to true when complete todos exist', async () => {
      service.setHasCompletedTodos(false);
      service.refreshHasCompletedTodos();
      httpMock
      .expectOne(req =>
        req.method === 'GET' &&
        req.url === apiPaths.GET_HAS_COMPLETED &&
        req.params.get('complete') === 'true' &&
        req.params.get('limit') === '1'
      )
      .flush({ totalItems: 2 });

      const hasCompletedTodos = await firstValueFrom(service.hasCompletedTodos$);
      expect(hasCompletedTodos).toBeTrue()
    });
  });

  describe('todoExistsByTitle', () => {
    it('should set isProcessing to true', async () => {
      const mockResponse = { exists: true };
      const promise = firstValueFrom(service.todoExistsByTitle(mockTodo));
      httpMock
        .expectOne(req => 
          req.method === 'GET' &&
          req.url === apiPaths.GET_TODO_EXISTS_BY_TITLE &&
          req.params.get('title') === 'Test todo')
        .flush(mockResponse)

      const response = await promise;
      expect(response).toBeTrue();
    })
  })
});

