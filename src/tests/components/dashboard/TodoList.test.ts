import TodoList from "$lib/components/dashboard/TodoList.svelte"
import { describe, test, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { defaultTodoList } from "$lib/utils";

describe("Default todolist with unauthorized user", async () => {
  const { mockCurrentTodoListStore, mockSignedInStore, mockTodoListsStore } = await vi.hoisted(() => import("../../mocks/store.mocks"));
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => null);

  // setup
  beforeAll(() => {
    vi.mock("../../../lib/store", async () => ({
      currentTodoList: mockCurrentTodoListStore,
      signedIn: mockSignedInStore,
      todoLists: mockTodoListsStore
    }));
  })

  afterEach(() => {
    cleanup()
    mockCurrentTodoListStore.mockSetSubscribeValue(defaultTodoList)
  })

  // util functions
  function startWithSingleTodo() {
    const alteredTodoList = defaultTodoList
    alteredTodoList.todos.push({
      id: 1,
      content: "fresh todo",
      complete: false
    })
    mockCurrentTodoListStore.mockSetSubscribeValue(alteredTodoList)
  }

  // tests start
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

  test("setting todo in todolist manually will render a todo", () => {
    // add a todo to mocked todolist with content "fresh todo"
    startWithSingleTodo()

    const {getByText} = render(TodoList);
    const newTodo = getByText(/fresh todo/i)

    expect(newTodo).toBeInTheDocument()
  })
})
