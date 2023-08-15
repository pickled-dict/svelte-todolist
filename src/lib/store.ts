import { writable, type Writable } from "svelte/store";
import type { TodoList } from "./interfaces";

export const defaultTodoList: TodoList = {
  id: 0,
  title: "Default TodoList",
  todos: []
}

export const signedIn = writable(false);
export const todoLists: Writable<TodoList[] | never[]> = writable([]);
export const currentTodoList: Writable<TodoList> = writable(structuredClone(defaultTodoList))
