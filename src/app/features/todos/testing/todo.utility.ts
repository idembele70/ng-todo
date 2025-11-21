import { HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { Observable, lastValueFrom } from "rxjs";
import { PaginatedTodos } from "../models/todo.model";

export function flushRefreshHasCompleted(
  httpMock: HttpTestingController,
  url: string,
  mockResponse: Partial<PaginatedTodos>
): void {
  const refreshCompletedReq = httpMock.expectOne(req =>
    req.url === url &&
    req.params.get('complete') === 'true' &&
    req.params.get('limit') === '1'
  );
  refreshCompletedReq.flush(!!mockResponse?.totalItems);
}

export async function flushHttp<T extends Object>(
  observable: Observable<T>,
  httpMock: HttpTestingController,
  url: string,
  body: Record<string, string | number> | null,
  method: 'POST' | 'PUT' | 'DELETE' | 'GET',
  mockResponse: T
): Promise<T> {
  const todoPromise = lastValueFrom(observable);

  const req: TestRequest = httpMock.expectOne(url);

  expect(req.request.method).toBe(method);
  expect(req.request.body).toEqual(body);
  req.flush(mockResponse);

  return todoPromise;
}