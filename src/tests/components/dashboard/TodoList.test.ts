import TodoList from "$lib/components/dashboard/TodoList.svelte"
import { describe, test, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/svelte";
import { defaultTodoList } from "$lib/utils";
import { mockedTodoLists, restHandlers, server } from "../../mocks/api";

describe("All TodoList Tests", async () => {
  const { mockCurrentTodoListStore, mockSignedInStore, mockTodoListsStore } = await vi.hoisted(() => import("../../mocks/store.mocks"));

  // setup
  beforeAll(() => {
    vi.mock("../../../lib/store", async () => ({
      currentTodoList: mockCurrentTodoListStore,
      signedIn: mockSignedInStore,
      todoLists: mockTodoListsStore
    }));
    server.listen();
  })

  afterEach(() => {
    cleanup()
    mockCurrentTodoListStore.mockSetSubscribeValue(structuredClone(defaultTodoList))
    server.resetHandlers()
  })

  afterAll(() => server.close())

  // util functions
  function startWithSingleTodo() {
    const alteredTodoList = structuredClone(defaultTodoList)
    alteredTodoList.todos.push({
      id: 1,
      content: "fresh todo",
      complete: false
    })
    mockCurrentTodoListStore.mockSetSubscribeValue(alteredTodoList)
  }

  function mockUserTodoLists() {
    mockSignedInStore.mockSetSubscribeValue(true);
    mockTodoListsStore.mockSetSubscribeValue(structuredClone(mockedTodoLists));
    mockCurrentTodoListStore.mockSetSubscribeValue(structuredClone(mockedTodoLists)[0])
  }

  // tests start
  test("should render the component", () => {
    const {getByText} = render(TodoList);
    const defaultTodoListTitle = getByText(/default todolist/i)

    expect(defaultTodoListTitle).toBeInTheDocument()
  })

  // title change tests
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
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => null);

    const {getByTestId, getByRole} = render(TodoList);
    const editTitleButton = getByTestId("todolist-edit-title");

    await fireEvent.click(editTitleButton);
    const input = getByRole("textbox");
    const submit = getByTestId("todolist-edit-title-submit");

    await fireEvent.input(input, {target: {value: ""}});
    await fireEvent.click(submit);

    expect(alertMock).toHaveBeenCalled();
  })

  test("clicking on X will end title edit mode", async () => {
    const {getByTestId, getByText} = render(TodoList);

    const editTitleButton = getByTestId("todolist-edit-title");
    await fireEvent.click(editTitleButton);
    const endEditModeButton = getByTestId("todolist-edit-title-end");
    await fireEvent.click(endEditModeButton)

    const title = getByText("Default TodoList");
    expect(title).toBeInTheDocument();

  })

  // todo adding
  test("setting todo in todolist manually will render a todo", () => {
    startWithSingleTodo()

    const {getByText} = render(TodoList);
    const newTodo = getByText(/fresh todo/i)

    expect(newTodo).toBeInTheDocument()
  })

  test("creating a todo via the 'create todo' with valid input will call the currentTodoList.set() function", async () => {
    mockCurrentTodoListStore.set = vi.fn();
    const {getByTestId} = render(TodoList);
    const createTodoButton = getByTestId("todolist-add-todo");

    await fireEvent.click(createTodoButton);
    const createTodoInput = getByTestId("create-input");
    await fireEvent.input(createTodoInput, {target: {value: "my new todo"}});

    const submitNewTodoButton = getByTestId("submit-create-todo");
    await fireEvent.click(submitNewTodoButton);

    expect(mockCurrentTodoListStore.set).toHaveBeenCalled();
  })

  test("clicking on X during 'create todo' will end the create mode", async () => {
    const {getByTestId, queryByTestId} = render(TodoList);
    const createTodoButton = getByTestId("todolist-add-todo");
    await fireEvent.click(createTodoButton);

    const endCreateModeButton = getByTestId("end-create-todo");
    await fireEvent.click(endCreateModeButton);

    const createTodoInput = queryByTestId("create-input");
    expect(createTodoInput).not.toBeInTheDocument();
  })

  test("attempting to create a todo with no input triggers an alert", async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => null);
    const {getByTestId} = render(TodoList);
    const createTodoButton = getByTestId("todolist-add-todo");

    await fireEvent.click(createTodoButton);
    const createTodoInput = getByTestId("create-input");
    await fireEvent.input(createTodoInput, {target: {value: ""}});

    const submitNewTodoButton = getByTestId("submit-create-todo");
    await fireEvent.click(submitNewTodoButton);

    expect(alertMock).toHaveBeenCalledTimes(1);
  })

  // editing a todo
  test("clicking on the edit button on a todo will trigger edit mode", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    const editModeButton = getByTestId("todo-edit-todo");
    await fireEvent.click(editModeButton);

    const todoEditInput = getByTestId("todo-edit-input");
    expect(todoEditInput).toBeInTheDocument();
  })

  test("entering valid input while editing todo will trigger currentTodoList.set() and edit the todo", async () => {
    mockCurrentTodoListStore.set = vi.fn();
    startWithSingleTodo();

    const {getByTestId, getByText} = render(TodoList);
    const editModeButton = getByTestId("todo-edit-todo");
    await fireEvent.click(editModeButton);

    const todoEditInput = getByTestId("todo-edit-input");
    await fireEvent.input(todoEditInput, {target: {value: "fresh todo (edited)"}})
    const confirmTodoButton = getByTestId("confirm-edit-todo");
    await fireEvent.click(confirmTodoButton);

    expect(mockCurrentTodoListStore.set).toHaveBeenCalled();

    const editedTodo = getByText("fresh todo (edited)");
    expect(editedTodo).toBeInTheDocument();
  })

  test("submitting edit todo input value that is empty will trigger alert", async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => null);

    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    const editModeButton = getByTestId("todo-edit-todo");
    await fireEvent.click(editModeButton);

    const todoEditInput = getByTestId("todo-edit-input");
    await fireEvent.input(todoEditInput, {target: {value: ""}})
    const confirmTodoButton = getByTestId("confirm-edit-todo");
    await fireEvent.click(confirmTodoButton);

    expect(alertMock).toHaveBeenCalled();
  })

  test("pressing X during edit todo mode will exit the edit mode", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    let editModeButton = getByTestId("todo-edit-todo");
    await fireEvent.click(editModeButton);

    const exitEditTodoButton = getByTestId("exit-edit-todo");
    await fireEvent.click(exitEditTodoButton);
    editModeButton = getByTestId("todo-edit-todo");

    expect(editModeButton).toBeInTheDocument();
  })

  // deleting a todo
  test("pressing on the delete button enters delete mode", async () => {
    startWithSingleTodo();

    const {getByTestId, getByText} = render(TodoList);
    const deleteModeButton = getByTestId("todo-delete-button");
    await fireEvent.click(deleteModeButton);
    const deleteTodoPrompt = getByText("Delete this todo?");

    expect(deleteTodoPrompt).toBeInTheDocument();
  })

  test("confirming the deletion triggers currentTodoList.set() and removes the todo", async () => {
    mockCurrentTodoListStore.set = vi.fn();
    startWithSingleTodo();

    const {getByTestId, queryByText} = render(TodoList);
    const deleteModeButton = getByTestId("todo-delete-button");
    await fireEvent.click(deleteModeButton);

    const confirmDeleteTodoButton = getByTestId("confirm-delete-todo");
    await fireEvent.click(confirmDeleteTodoButton);
    expect(mockCurrentTodoListStore.set).toHaveBeenCalled();

    const todo = queryByText("fresh todo");
    expect(todo).not.toBeInTheDocument();
  })

  test("clicking the X during todo delete will exit delete mode", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    let deleteModeButton = getByTestId("todo-delete-button");
    await fireEvent.click(deleteModeButton);
    const exitDeleteModeButton = getByTestId("exit-delete-todo");
    await fireEvent.click(exitDeleteModeButton);

    deleteModeButton = getByTestId("todo-delete-button");
    expect(deleteModeButton).toBeInTheDocument();
  })

  // change complete state of todo
  test("clicking on the todo will set the todo to complete (text with strikethrough)", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    const todoContentNotComplete = getByTestId("todo-content-not-complete");
    await fireEvent.click(todoContentNotComplete);

    const todoContentComplete = getByTestId("todo-content-complete");

    expect(todoContentComplete).toBeInTheDocument();
  })

  test("clicking on the todo twice will set the todo to complete then not complete", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);
    let todoContentNotComplete = getByTestId("todo-content-not-complete");
    await fireEvent.click(todoContentNotComplete);

    const todoContentComplete = getByTestId("todo-content-complete");
    expect(todoContentComplete).toBeInTheDocument();
    await fireEvent.click(todoContentComplete);

    todoContentNotComplete = getByTestId("todo-content-not-complete");
    expect(todoContentNotComplete).toBeInTheDocument();
  })

  test("clicking the complete button will set the todo to complete", async () => {
    startWithSingleTodo();

    const {getByTestId} = render(TodoList);

    const todoCompleteButton = getByTestId("todo-content-complete-button");
    await fireEvent.click(todoCompleteButton);

    const todoContentComplete = getByTestId("todo-content-complete");
    expect(todoContentComplete).toBeInTheDocument();
  })

  test("change todolist title while signed in", async () => {
    mockUserTodoLists();

    const {getByTestId, getByRole, findByText} = render(TodoList);
    const editTitleButton = getByTestId("todolist-edit-title");
    await fireEvent.click(editTitleButton);

    const input = getByRole("textbox");
    const submit = getByTestId("todolist-edit-title-submit");
    await fireEvent.input(input, {target: {value: "new title"}});
    await fireEvent.click(submit);

    const newTitle = await findByText("new title");

    expect(newTitle).toBeInTheDocument();
  })

  // test("add todo to todolist while signed in", async () => {
  //   mockUserTodoLists();
  //
  //   const {getByTestId, findByText, debug} = render(TodoList);
  //   const createTodoButton = getByTestId("todolist-add-todo");
  //
  //   await fireEvent.click(createTodoButton);
  //   const createTodoInput = getByTestId("create-input");
  //   await fireEvent.input(createTodoInput, {target: {value: "my new todo"}});
  //
  //   const submitNewTodoButton = getByTestId("submit-create-todo");
  //   await fireEvent.click(submitNewTodoButton);
  //
  //
  //   waitFor(() => findByText("my new todo"));
  //   mockTodoListsStore.subscribe(val => console.log(val))
  //
  //   expect(newTodo).toBeInTheDocument();
  // });

  // test("delete todo works while signed in", async () => {
  //   mockUserTodoLists();
  //   const {getByTestId, findByText, debug} = render(TodoList);
  //
  //   const deleteModeButton = getByTestId("todo-delete-button");
  //   await fireEvent.click(deleteModeButton);
  //   const submitDeleteTodo = getByTestId("confirm-delete-todo");
  //   await fireEvent.click(submitDeleteTodo);
  //
  //   const deletedTodo = await findByText("some todo");
  //
  //   mockCurrentTodoListStore.subscribe(val => console.log(val))
  //
  //   expect(deletedTodo).not.toBeInTheDocument();
  // })
})

