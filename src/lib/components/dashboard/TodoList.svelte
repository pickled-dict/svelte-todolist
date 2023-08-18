<script lang="ts">
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import { clickOutside } from "$lib/eventFunctions";
	import { sendPostRequest, sendPutRequest, sendDeleteRequest} from "$lib/fetchRequests";
  import type { Todo, TodoList } from "$lib/interfaces";
  import { currentTodoList, signedIn, todoLists } from "$lib/store"
  import { focusOnElement, stringShorten } from "$lib/utils";
  import {API_URL, TODO_ROUTE, TODOLIST_ROUTE} from "$lib/constants"

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
  function confirmUpdateTodo(todoId: number) {
    if (updateTodoContent.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-input");
      if (el !== null) {
        focusOnElement(el)
      }
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
          .then(res => {
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
          })
          .catch(err => console.error(err))
      } else {
        console.error("something went wrong while updating todo")
      }
    } else {
      currentTodoListStore.todos = alteredTodos;
      currentTodoList.set(currentTodoListStore);
    }
    todoInEditMode = null;
  }

  function confirmDeleteTodo(id: number) {
    const alteredTodos = currentTodoListStore.todos.filter(td => td.id !== id)
    if (!isDefaultTodoList(currentTodoListStore)) {
      sendDeleteRequest(`${TODO_ROUTE}/${id}`, Cookies.get("token"))
        .then(async (res) => {
          await res.json().then(() => {
            currentTodoListStore.todos = alteredTodos;
            currentTodoList.set(currentTodoListStore);
          })
        })
        .catch(err => console.error(err))
    } else {
      currentTodoListStore.todos = alteredTodos;
      currentTodoList.set(currentTodoListStore);
    }

    todoInDeleteMode = null;
  }

	function confirmCreateTodo() {
    if (newTodoContent.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("create-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }

    if (!isDefaultTodoList(currentTodoListStore)) {
      sendPostRequest(
        `${API_URL}/api/todolist/${currentTodoListStore.id}/todo`, {
          content: newTodoContent,
          complete: false
        }, Cookies.get("token"))
        .then(res => {
          return res.json() as unknown as Todo;
        })
        .then(data => {
          currentTodoListStore.todos.push(data);
          currentTodoList.set(currentTodoListStore);
        })
        .catch(err => {console.error(err)})
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
    }

    inCreateTodoMode = false;
    newTodoContent = "";
	}

  function confirmUpdateTodoListTitle(id: number) {
    if (updateTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-title-input");
      if (el !== null) {
        focusOnElement(el)
      }
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
          await res.json().then(() => {
            currentTodoListStore.title = updateTodoListTitle;
            currentTodoList.set(currentTodoListStore);
            todoLists.set(alteredTodoLists);
          })
        }).catch((err) => console.error(err))
    } else {
      currentTodoListStore.title = updateTodoListTitle;
      currentTodoList.set(currentTodoListStore);
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
          complete: !currentTodo.complete
        }, Cookies.get("token"))
          .then(async (res) => {
            await res.json()
            .then(() => {
              currentTodoListStore.todos = alteredTodos;
              currentTodoList.set(currentTodoListStore);
            })
          }).catch(err => console.error(err))
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
    throw new Error("Function not implemented.");
  }
</script>

<!-- TodoList Container Block -->
<div class="w-full h-full bg-gray-100 flex flex-col">
  <!-- if todolist in edit mode, display this, else display title with options -->
  {#if inEditTodoListTitleMode}
    <div 
      data-testid="todolist-container" 
      class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <div class="flex justify-between" use:clickOutside on:click_outside={() => inEditTodoListTitleMode = false}>
        <input 
          id="edit-title-input"
          class="bg-gray-200 m-[1px] pl-1"
          value={currentTodoListStore.title}
          on:focusin={() => updateTodoListTitle = currentTodoListStore.title}
          on:input={handleChangeTodoListTitle}
          use:focusOnElement />
          <div class="flex items-center">
            <button data-testid="todolist-edit-title-submit" on:click={() => confirmUpdateTodoListTitle(currentTodoListStore.id)}>
              <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
            </button>
            <button data-testid="todolist-edit-title-end" on:click={() => inEditTodoListTitleMode = false}>
              <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
            </button>
          </div>
      </div>
    </div>
  {:else}
    <div class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <button data-testid="todolist-edit-title" class="relative top-2 left-[2px] mr-1" on:click={() => inEditTodoListTitleMode = true}>
        <Icon class="w-[20px] h-[20px]" icon="tabler:edit" />
      </button>
      <h3 class="text-2xl font-bold">{stringShorten(currentTodoListStore.title, 25)}</h3>
      <button data-testid="todolist-add-todo" class="ml-2" on:click={() => inCreateTodoMode = true}>
        <Icon class="text-red-500 w-[20px] h-[20px]" icon="ph:plus-fill" />
      </button>
      {#if signedInStore && isDefaultTodoList(currentTodoListStore)}
        <button on:click={handleSaveTodoList}>
          <Icon class="text-red-500 w-[20px] h-[20px]" icon="material-symbols:save" />
        </button>
      {/if}
    </div>
  {/if}
  <!-- Main Todos block -->
  <div class="w-full h-full flex justify-center border border-l-black bg-gray-200 overflow-y-scroll">
    <div class="h-full w-[400px] bg-gray-100">
      {#if currentTodoListStore.todos}
        <!-- Show todos -->
        {#each currentTodoListStore.todos as todo}
          <div class="w-full border border-b-gray-300">
            <!-- if todo is in edit mode, do: -->
            {#if todoInEditMode === todo.id}
              <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => todoInEditMode = null}>
                <div class="border border-b-black flex justify-between w-full">
                  <input 
                    data-testid="todo-edit-input"
                    id="edit-input"
                    class="bg-gray-200 m-[1px] pl-1 w-full"
                    value={todo.content}
                    on:focusin={() => updateTodoContent = todo.content}
                    on:input={handleChangeTodoTitle}
                    use:focusOnElement />
                </div>
                <div class="flex items-center">
                  <button data-testid="confirm-edit-todo" on:click={() => confirmUpdateTodo(todo.id)}>
                    <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
                  </button>
                  <button data-testid="exit-edit-todo" on:click={() => todoInEditMode = null}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                  </button>
                </div>
              </div>
              <!-- else if todo is in delete mode, do: -->
              {:else if todoInDeleteMode === todo.id}
              <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => todoInDeleteMode = null}>
                <p class="text-red-500 font-bold">Delete this todo?</p>

                <div class="h-full w-[40px] flex items-center">
                  <button data-testid="confirm-delete-todo" class="hover:cursor-pointer" on:click={() => confirmDeleteTodo(todo.id)}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                  <button data-testid="exit-delete-todo" class="hover:cursor-pointer" on:click={() => todoInDeleteMode = null}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                  </button>
                </div>
              </div>
              <!-- Else display todo with options -->
            {:else}
              <div class="mx-2 my-[1px] flex justify-between">
                {#if todo.complete}
                  <button data-testid="todo-content-complete" class="w-full text-left line-through" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                {:else}
                  <button data-testid="todo-content-not-complete" class="w-full text-left" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                {/if}
                <div class="flex items-center">
                  <button data-testid="todo-content-complete-button" class="hover:cursor-pointer" on:click={() => handleToggleComplete(todo.id)}>
                    <Icon icon="zondicons:checkmark" class="w-[20px] h-[20px]"/>
                  </button>
                  <button data-testid="todo-edit-todo" class="hover:cursor-pointer" on:click={() => todoInEditMode = todo.id}>
                    <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                  </button>
                  <button data-testid="todo-delete-button" class="hover:cursor-pointer" on:click={() => todoInDeleteMode = todo.id}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
      <!-- logic for handling "create todo" mode -->
      {#if inCreateTodoMode} 
        <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => {inCreateTodoMode = false}}>
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
            <button data-testid="submit-create-todo" on:click={confirmCreateTodo}>
              <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
            </button>
            <button data-testid="end-create-todo" on:click={() => inCreateTodoMode = false}>
              <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
