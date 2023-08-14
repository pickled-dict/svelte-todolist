import { writable, type Writable } from "svelte/store";
import type { TodoList } from "./interfaces";

export const signedIn = writable(false);
export const todoLists: Writable<TodoList[] | never[]> = writable([]);
