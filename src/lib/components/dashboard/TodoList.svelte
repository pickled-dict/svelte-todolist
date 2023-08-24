<script lang="ts">
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import type { ButtonOptions, Todo, TodoList } from "$lib/interfaces";
  import { clickOutside } from "$lib/eventFunctions";
	import { sendPostRequest, sendPutRequest, sendDeleteRequest} from "$lib/fetchRequests";
  import { currentTodoList, signedIn, todoLists } from "$lib/store"
  import { focusOnElement, unauthorizedSignout, stringShorten, addToast } from "$lib/utils";
  import {API_URL, TODO_ROUTE, TODOLIST_ROUTE} from "$lib/constants"
	import OptionsWidget from "../widgets/optionsWidget.svelte";

  interface TodoDto {
    content: string,
    complete?: boolean
  }

  interface SaveTodoListDto {
    title: string,
    todos: TodoDto[]
  }

  // === local state
  let inCreateTodoMode = false;
  let inEditTodoListTitleMode = false;
  let todoInEditMode: null | number = null;
  let todoInDeleteMode: null | number = null;
  let updateTodoContent = "";
  let newTodoContent = "";
  let updateTodoListTitle = "";

  // subscriber variables
  let currentTodoListStore: TodoList;
  let todoListsStore: TodoList[];
  let signedInStore: boolean;

  // === subscription functions for svelte store
  currentTodoList.subscribe((current) => {
    currentTodoListStore = current;
  })

  todoLists.subscribe(todoLists => {
    todoListsStore = todoLists;
  })

  signedIn.subscribe((isSignedIn) => {
    signedInStore = isSignedIn;
  })

  // === util functions
  // workaround for magic number conditional check
  function isDefaultTodoList(todoList: TodoList) {
    return todoList.id === 0;
  }
  
  // change event handlers
  function handleChangeTodoTitle(event: Event) {
    updateTodoContent = (<HTMLTextAreaElement> event.target).value;
  }

  function handleChangeNewTodoTitle(event: Event) {
    newTodoContent = (<HTMLTextAreaElement> event.target).value;
  }

  function handleChangeTodoListTitle(event: Event) {
    updateTodoListTitle = (<HTMLTextAreaElement> event.target).value;
  }

  // === handler functions
  function confirmUpdateTodo(e:Event, todoId: number) {
    e.preventDefault();
    if (updateTodoContent.length === 0) {
      addToast({message: "Cannot update todo with empty content", dismissable: true, timeout: 2000, type: "WARN"})
      return;
    }

    if (updateTodoContent.length > 5000) {
      addToast({message: "Todo content length cannot exceed 5000 characters", dismissable: true, timeout: 3000, type: "ERROR"})
      return;
    }

    const alteredTodos = currentTodoListStore.todos.map((td) => {
      if (td.id === todoId) {
        td.content = updateTodoContent;
        return td;
      }
      return td;
    })

    if (!isDefaultTodoList(currentTodoListStore)) {
      const curTodo = currentTodoListStore.todos.find(td => td.id === todoId);
      if (curTodo) {
        sendPutRequest(`${TODO_ROUTE}/${todoId}`, {
          content: updateTodoContent,
          complete: curTodo.complete
        }, Cookies.get("token"))
          .then(async res => {
            if (!res.ok) {
              throw new Error((await res.json()).message)
            }
            return res.json() as unknown as Todo
          })
          .then((data) => {
            const alteredTodos = currentTodoListStore.todos.map(td => {
              if (td.id === todoId) {
                return data;
              }
              return td;
            })
            currentTodoListStore.todos = alteredTodos;
            currentTodoList.set(currentTodoListStore);
            addToast({message: "Todo was successfully updated", dismissable: true, timeout: 2000, type: "INFO"})
          })
          .catch(err => {
            unauthorizedSignout();
            console.error(err)
          })
      } else {
        console.error("something went wrong while updating todo")
      }
    } else {
      currentTodoListStore.todos = alteredTodos;
      currentTodoList.set(currentTodoListStore);
      addToast({message: "Todo was successfully updated", dismissable: true, timeout: 2000, type: "INFO"})
    }
    todoInEditMode = null;
  }

  function confirmDeleteTodo(e:Event, id: number) {
    e.preventDefault();
    const alteredTodos = currentTodoListStore.todos.filter(td => td.id !== id)
    if (!isDefaultTodoList(currentTodoListStore)) {
      sendDeleteRequest(`${TODO_ROUTE}/${id}`, Cookies.get("token"))
        .then(async (res) => {
          if (!res.ok) {
            throw new Error((await res.json()).message)
          }
          await res.json().then(() => {
            currentTodoListStore.todos = alteredTodos;
            currentTodoList.set(currentTodoListStore);
            addToast({message: "Todo was successfully deleted", dismissable: true, timeout: 2000, type: "INFO"})
          })
        })
        .catch(err => {
          unauthorizedSignout();
          console.error(err)
        })
    } else {
      currentTodoListStore.todos = alteredTodos;
      currentTodoList.set(currentTodoListStore);
      addToast({message: "Todo was successfully deleted", dismissable: true, timeout: 2000, type: "INFO"})
    }

    todoInDeleteMode = null;
  }

	function confirmCreateTodo(e: Event) {
    e.preventDefault();
    if (newTodoContent.length === 0) {
      addToast({message: "Cannot create todo with empty content", dismissable: true, timeout: 2000, type: "WARN"})
      return;
    }

    if (newTodoContent.length > 5000) {
      addToast({message: "Todo content length cannot exceed 5000 characters", dismissable: true, timeout: 3000, type: "ERROR"})
      return;
    }

    if (!isDefaultTodoList(currentTodoListStore)) {
      sendPostRequest(
        `${API_URL}/api/todolist/${currentTodoListStore.id}/todo`, {
          content: newTodoContent,
          complete: false
        }, Cookies.get("token"))
        .then(async res => {
          if (!res.ok) {
            throw new Error((await res.json()).message)
          }
          return res.json() as unknown as Todo;
        })
        .then(data => {
          currentTodoListStore.todos.push(data);
          currentTodoList.set(currentTodoListStore);
          addToast({message: "Todo has been successfully created", dismissable: true, timeout: 2000, type: "INFO"})
        })
        .catch(err => {
          unauthorizedSignout();
          console.error(err);
        })
    } else {
      let highestId = 0;
      if (currentTodoListStore.todos.length > 0) {
        const highestIdTodo = currentTodoListStore.todos.reduce((max, current) => {
          if (current.id > max.id) {
            return current;
          }
          return max;
        })
        highestId = highestIdTodo.id;
      }
      const newTodo = {
        id: highestId + 1,
        content: newTodoContent,
        complete: false
      }

      currentTodoListStore.todos.push(newTodo);
      currentTodoList.set(currentTodoListStore);
      addToast({message: "Todo has been successfully created", dismissable: true, timeout: 2000, type: "INFO"})
    }

    inCreateTodoMode = false;
    newTodoContent = "";
	}

  function confirmUpdateTodoListTitle(e: Event, id: number) {
    console.log(`from todolist: ${id}`);
    e.preventDefault();
    if (updateTodoListTitle.length === 0) {
      addToast({message: "Cannot update todolist with empty title", dismissable: true, timeout: 2000, type: "WARN"})
      return;
    }

    if (!isDefaultTodoList(currentTodoListStore)) {
      const alteredTodoLists = todoListsStore.map(tl => {
        if (tl.id === id) {
          return currentTodoListStore;
        }
        return tl;
      })
      sendPutRequest(`${TODOLIST_ROUTE}/${id}`, {
        title: updateTodoListTitle
      }, Cookies.get("token")).then(async (res) => {
          if (!res.ok) {
            throw new Error((await res.json()).message)
          }
          await res.json().then(() => {
            currentTodoListStore.title = updateTodoListTitle;
            currentTodoList.set(currentTodoListStore);
            todoLists.set(alteredTodoLists);
            addToast({message: "Todolist title has been successfully updated", dismissable: true, timeout: 2000, type: "INFO"})
          })
        }).catch((err) => {
          unauthorizedSignout();
          console.error(err)
        })
    } else {
      currentTodoListStore.title = updateTodoListTitle;
      currentTodoList.set(currentTodoListStore);
      addToast({message: "Todolist title has been successfully updated", dismissable: true, timeout: 2000, type: "INFO"})
    }

    inEditTodoListTitleMode = false;
  }

  function handleToggleComplete(id: number) {
    const alteredTodos = currentTodoListStore.todos.map(td => {
      if (td.id === id) {
        td.complete = !td.complete
        return td
      }
      return td
    })

    if (!isDefaultTodoList(currentTodoListStore)) {
      const currentTodo = currentTodoListStore.todos.find(td => td.id === id)
      if (currentTodo) {
        sendPutRequest(`${TODO_ROUTE}/${id}`, {
          content: currentTodo.content,
          complete: currentTodo.complete
        }, Cookies.get("token"))
          .then(async res => {
            if (!res.ok) {
              throw new Error((await res.json()).message)
            }
            currentTodoListStore.todos = alteredTodos;
            currentTodoList.set(currentTodoListStore);
          }).catch(err => {
            unauthorizedSignout();
            console.error(err)
          })
      } else {
        console.error("Something went wrong while toggling complete")
      }
    } else {
      currentTodoListStore.todos = alteredTodos;
      currentTodoList.set(currentTodoListStore);
    }
  }

  // Save todolist to user todolists
  function handleSaveTodoList() {
    const todoDto: TodoDto[] = currentTodoListStore.todos.map((td) => ({content: td.content, complete: td.complete}));
    const newTodoList: SaveTodoListDto = {
      title: currentTodoListStore.title,
      todos: todoDto
    };

    sendPostRequest(`${TODOLIST_ROUTE}/save`, newTodoList, Cookies.get("token"))
      .then(async res => {
        if (!res.ok) {
          throw new Error((await res.json()).message)
        }
        const result = await res.json();
        currentTodoList.set(result);
        todoLists.set([...todoListsStore, result]);
      })
      .catch(err => {
        unauthorizedSignout();
        console.error(err);
      })
  }

  // === buttons and mode options
  const editTodoListTitleOptions: ButtonOptions[] = [
    {
      testId: "todolist-edit-title-submit",
      tooltip: "Confirm edit todolist title",
      icon: "ph:check-bold",
      callback: (e: Event) => confirmUpdateTodoListTitle(e, currentTodoListStore.id), submits: true
    },
    {
      testId: "todolist-edit-title-end",
      tooltip: "Cancel edit",
      icon: "ph:x-bold",
      callback: () => inEditTodoListTitleMode = false
    }
  ]

  const todoInEditModeOptions = (todoId: number): ButtonOptions[] => [
    {
      testId: "confirm-edit-todo",
      tooltip: "Confirm edit todo",
      icon: "ph:check-bold",
      callback: (e: Event) => confirmUpdateTodo(e, todoId),
      submits: true
    },
    {
      testId: "exit-edit-todo",
      tooltip: "Cancel edit",
      icon: "ph:x-bold",
      callback: () => todoInEditMode = null
    }
  ]

  const todoInDeleteModeOptions = (todoId: number): ButtonOptions[] => [
    {
      testId: "confirm-delete-todo",
      tooltip: "Confirm delete todo",
      icon: "ph:check-bold",
      callback: (e: Event) => confirmDeleteTodo(e, todoId),
      submits: true
    },
    {
      testId: "exit-delete-todo",
      tooltip: "Cancel delete",
      icon: "ph:x-bold",
      callback: () => todoInDeleteMode = null
    }
  ]

  const defaultTodoOptions = (todoId: number): ButtonOptions[] => [
    {
      testId: "todo-content-complete-button",
      tooltip: "Mark todo as complete",
      icon: "zondicons:checkmark",
      callback: () => handleToggleComplete(todoId)
    },
    {
      testId: "todo-edit-todo",
      tooltip: "Edit this todo",
      icon: "mingcute:edit-2-line",
      callback: () => todoInEditMode = todoId
    },
    {
      testId: "todo-delete-button",
      tooltip: "Delete this todo",
      icon: "mingcute:delete-2-line",
      callback: () => todoInDeleteMode = todoId
    }
  ]

  const createTodoOptions: ButtonOptions[] = [
    {
      testId: "submit-create-todo",
      tooltip: "Confirm create todo",
      icon: "ph:check-bold",
      callback: (e: Event) => confirmCreateTodo(e),
      submits: true
    },
    {
      testId: "end-create-todo",
      tooltip: "Cancel create todo",
      icon: "ph:x-bold",
      callback: () => inCreateTodoMode = false
    }
  ]
</script>

<!-- TodoList Container Block -->
<div class="w-full h-full bg-gray-100 flex flex-col">
  <!-- if todolist in edit mode, display this, else display title with options -->
  {#if inEditTodoListTitleMode}
    <div 
      data-testid="todolist-container" 
      class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <form class="flex justify-between" use:clickOutside on:click_outside={() => inEditTodoListTitleMode = false}>
        <input 
          id="edit-title-input"
          class="bg-gray-200 m-[1px] pl-1"
          value={currentTodoListStore.title}
          on:focusin={() => updateTodoListTitle = currentTodoListStore.title}
          on:input={handleChangeTodoListTitle}
          use:focusOnElement />
          <div class="flex items-center">
            <OptionsWidget options={editTodoListTitleOptions} />
          </div>
      </form>
    </div>
  {:else}
    <div class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <button title="Edit todolist title" data-testid="todolist-edit-title" class="relative top-2 left-[2px] mr-1" on:click={() => inEditTodoListTitleMode = true}>
        <Icon class="w-[20px] h-[20px]" icon="tabler:edit" />
      </button>
      <h3 class="text-2xl font-bold">{stringShorten(currentTodoListStore.title, 25)}</h3>
      <button title="Create a todo" data-testid="todolist-add-todo" class="ml-2" on:click={() => inCreateTodoMode = true}>
        <Icon class="text-red-500 w-[20px] h-[20px]" icon="ph:plus-fill" />
      </button>
      {#if signedInStore && isDefaultTodoList(currentTodoListStore)}
        <button title="Save this todolist" on:click={handleSaveTodoList}>
          <Icon class="text-red-500 w-[20px] h-[20px]" icon="material-symbols:save" />
        </button>
      {/if}
    </div>
  {/if}
  <!-- Main Todos block -->
  <div class="w-full h-full flex justify-center border border-l-black bg-gray-200 overflow-y-scroll">
    <div class="h-full w-[400px]">
      {#if currentTodoListStore.todos.length > 0 || inCreateTodoMode}
        <!-- Show todos -->
        {#each currentTodoListStore.todos as todo}
          <div class="w-full my-2 rounded-lg">
            <!-- if todo is in edit mode, do: -->
            {#if todoInEditMode === todo.id}
              <form class="mx-2 my-[1px] flex flex-col" use:clickOutside on:click_outside={() => todoInEditMode = null}>
                <div class="flex justify-between w-full bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg">
                  <textarea 
                    style="resize: none;"
                    rows=5
                    data-testid="todo-edit-input"
                    id="edit-input"
                    class="bg-gray-100 outline-gray-300 m-[1px] pl-1 w-full"
                    value={todo.content}
                    on:focusin={() => updateTodoContent = todo.content}
                    on:input={handleChangeTodoTitle}
                    use:focusOnElement />
                </div>
                <div class="flex self-end ml-2 bg-gray-100 rounded-b-lg pb-1 px-2 drop-shadow-lg">
                  <OptionsWidget options={todoInEditModeOptions(todo.id)} />
                </div>
              </form>
              <!-- else if todo is in delete mode, do: -->
              {:else if todoInDeleteMode === todo.id}
              <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => todoInDeleteMode = null}>
                <p class="text-red-500 font-bold">Delete this todo?</p>
                <div class="h-full w-[40px] flex items-center">
                  <OptionsWidget options={todoInDeleteModeOptions(todo.id)} />
                </div>
              </div>
              <!-- Else display todo with options -->
            {:else}
              <div class="mx-2 my-[1px] flex flex-col">
                {#if todo.content.length > 150}
                    {#if todo.complete}
                      <button data-testid="todo-content-complete" class="w-full text-left line-through bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleToggleComplete(todo.id)}>{stringShorten(todo.content, 150)}</button>
                    {:else}
                      <button data-testid="todo-content-not-complete" class="w-full text-left bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleToggleComplete(todo.id)}>{stringShorten(todo.content, 150)}</button>
                    {/if}
                  {:else}
                    {#if todo.complete}
                      <button data-testid="todo-content-complete" class="w-full text-left line-through bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                    {:else}
                      <button data-testid="todo-content-not-complete" class="w-full text-left bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                    {/if}
                {/if}
                <div class="flex self-end ml-2 bg-gray-100 rounded-b-lg pb-1 px-2 drop-shadow-lg">
                  <OptionsWidget options={defaultTodoOptions(todo.id)} />
                </div>
              </div>
            {/if}
          </div>
        {/each}
        {:else}
        <p class="m-2 leading-5">This TodoList has no todos! Click the "+" button to add some!</p>
      {/if}
      <!-- logic for handling "create todo" mode -->
      {#if inCreateTodoMode} 
        <form class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => {inCreateTodoMode = false}}>
          <div class="border border-b-black flex justify-between w-full">
            <input 
              id="create-input"
              data-testid="create-input"
              class="bg-gray-200 m-[1px] pl-1 w-full"
              placeholder="new todo title"
              on:input={handleChangeNewTodoTitle}
              use:focusOnElement />
          </div>
          <div class="flex items-center">
            <OptionsWidget options={createTodoOptions} />
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>
