export interface ErrorMessage {
  debugMessage: string,
  message: string,
  status: string,
  subErrors: Array<ErrorMessage> | null,
  timestamp: string
};

export interface FormError {
  field: string|number,
  message: string
}

export interface Todo {
  id: number,
  content: string,
  complete: boolean
}

export interface TodoList {
  id: number,
  title: string,
  todos: Array<Todo>
}

export interface MessageResponse {
  message: string,
}

export interface ButtonOptions {
  tooltip: string,
  icon: string,
  callback: (...args: any[]) => void,
  testId?: string,
  submits?: boolean
}

export type ToastTypes = "INFO" | "WARN" | "ERROR"

export interface Toast {
  id: number,
  type: ToastTypes,
  dismissable: boolean,
  timeout: number,
  message: string
}
