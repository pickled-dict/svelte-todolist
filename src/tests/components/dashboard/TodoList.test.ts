import TodoList from "$lib/components/dashboard/TodoList.svelte"
import { describe, test, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import { defaultTodoList } from "$lib/store";

const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => null);
const mockCurrentTodoListWritable = writable<TodoList>();

export const mockCurrentTodoListStore = {
  subscribe: mockCurrentTodoListWritable.subscribe,
  set: vi.fn(),
  mockSetSubscribeValue: (value: TodoList): void => mockCurrentTodoListWritable.set(value)
}

describe("Default todolist with unauthorized user", () => {
  test("should render the component", () => {
    const {getByText} = render(TodoList);
    const defaultTodoListTitle = getByText(/default todolist/i)

    expect(defaultTodoListTitle).toBeInTheDocument()
  })

  test("should be able to change the title", async () => {
    const {getByTestId, getByRole, getByText} = render(TodoList);
    const editTitleButton = getByTestId("todolist-edit-title");

    await fireEvent.click(editTitleButton);
    const input = getByRole("textbox");
    const submit = getByTestId("todolist-edit-title-submit");

    await fireEvent.input(input, {target: {value: "new title"}});
    await fireEvent.click(submit);
    const title = getByText("new title");

    expect(title).toBeInTheDocument();
  })

  test("entering empty input on change title spawns alert", async () => {
    const {getByTestId, getByRole} = render(TodoList);
    const editTitleButton = getByTestId("todolist-edit-title");

    await fireEvent.click(editTitleButton);
    const input = getByRole("textbox");
    const submit = getByTestId("todolist-edit-title-submit");

    await fireEvent.input(input, {target: {value: ""}});
    await fireEvent.click(submit);

    expect(alertMock).toHaveBeenCalled();
  })
})
