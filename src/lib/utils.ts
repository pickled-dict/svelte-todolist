import type { TodoList } from "./interfaces"

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
