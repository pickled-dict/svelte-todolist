import { writable, type Writable } from "svelte/store";
import type { Toast, TodoList } from "./interfaces";
import { defaultTodoList } from "./utils";

export const signedIn = writable(false);
export const todoLists: Writable<TodoList[] | never[]> = writable([]);
export const currentTodoList: Writable<TodoList> = writable(structuredClone(defaultTodoList));
export const toasts: Writable<Toast[]> = writable([]);
