import type { TodoList } from "$lib/interfaces";
import { writable } from "svelte/store";
import { vi } from "vitest";
import { defaultTodoList } from "$lib/utils";

const mockCurrentTodoListWritable = writable<TodoList>(structuredClone(defaultTodoList));
export const mockCurrentTodoListStore = {
  subscribe: mockCurrentTodoListWritable.subscribe,
  set: vi.fn(),
  mockSetSubscribeValue: (value: TodoList): void => mockCurrentTodoListWritable.set(value)
}

const mockTodoListsWritable = writable<TodoList[] | never[]>();
export const mockTodoListsStore = {
  subscribe: mockTodoListsWritable.subscribe,
  set: vi.fn(),
  mockSetSubscribeValue: (value: TodoList[]): void => mockTodoListsWritable.set(value)
}

const mockSignedInWritable = writable<boolean>(false);
export const mockSignedInStore = {
  subscribe: mockSignedInWritable.subscribe,
  set: vi.fn(),
  mockSetSubscribeValue: (value: boolean): void => mockSignedInWritable.set(value)
}
