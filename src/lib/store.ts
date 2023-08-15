import { writable, type Writable } from "svelte/store";
import type { TodoList } from "./interfaces";

export const signedIn = writable(false);
export const todoLists: Writable<TodoList[] | never[]> = writable([]);
export const currentTodoList: Writable<TodoList> = writable({
  id: 0,
  title: "Default TodoList",
  todos: [
    {
      id: 1,
      content: "Eat food",
      complete: false
    },
    {
      id: 2,
      content: "Walk the fridge",
      complete: false
    },
    {
      id: 3,
      content: "Shop for more food",
      complete: false
    },
  ]
})
