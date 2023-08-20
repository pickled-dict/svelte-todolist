import Cookies from "js-cookie"
import type { Toast, TodoList } from "./interfaces"
import { currentTodoList, signedIn, toasts, todoLists } from "./store"

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

export function addToast(toast: Partial<Toast>) {
  const id = Math.floor(Math.random() * 10000);
  const defaults: Toast = {
    id,
    type: "INFO",
    dismissable: true,
    timeout: 3000,
    message: "default message"
  }

  console.log(toast);
  toasts.update((toasts) => [{...defaults, ...toast}, ...toasts])

  toasts.subscribe(t => {
    console.log(t);
  })

  if (toast.timeout) {
    setTimeout(() => {
      dismissToast(id);
    }, toast.timeout);
  }
}

export function dismissToast(id: number) {
  toasts.update((toasts) => toasts.filter((toast) => toast.id !== id))
}
