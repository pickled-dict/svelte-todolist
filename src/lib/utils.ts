import Cookies from "js-cookie"
import type { TodoList } from "./interfaces"
import { currentTodoList, signedIn, todoLists } from "./store"

export const defaultTodoList: TodoList = {
  id: 0,
  title: "Default TodoList",
  todos: []
}

export function focusOnElement(el: HTMLElement) {
  el.focus()
}

export function stringShorten(s: string, to: number) {
  if (s.length > to) {
    return s.slice(0, to) + "..."
  }
  return s
}

export function fullSignOut() {
  signedIn.set(false);
  currentTodoList.set(structuredClone(defaultTodoList))
  todoLists.set([]);
  Cookies.remove("token");
}
