<script lang="ts">
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import { clickOutside } from "$lib/eventFunctions";
	import { API_URL, TODO, sendPostRequest, sendPutRequest, sendDeleteRequest, TODOLIST } from "$lib/fetchRequests";
  import type { MessageResponse, Todo, TodoList } from "$lib/interfaces";
  import { currentTodoList, signedIn, todoLists } from "$lib/store"
  import { focusOnElement, stringShorten } from "$lib/utils";

  // state declarations
  let todoList: TodoList;
  let inCreateMode = false;
  let todoListTitleInEditMode = false;
  let signedInStore: boolean;
  let todoListsStore: TodoList[];
  let todoInEditMode: null | number = null;
  let todoInDeleteMode: null | number = null;
  let updateTodoContent = "";
  let newTodoContent = "";
  let updateTodoListTitle = "";

  // observables
  currentTodoList.subscribe((current) => {
    todoList = current;
  })

  todoLists.subscribe(todoLists => {
    todoListsStore = todoLists;
  })

  signedIn.subscribe((isSignedIn) => {
    signedInStore = isSignedIn;
  })

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

  // === crud functions ===
  // Update Todo
  function handleUpdateTodo(todoId: number) {
    if (updateTodoContent.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }

    const alteredTodos = todoList.todos.map((td) => {
      if (td.id === todoId) {
        td.content = updateTodoContent;
        return td;
      }
      return td;
    })

    if (!isDefaultTodoList(todoList)) {
      const curTodo = todoList.todos.find(td => td.id === todoId);
      if (curTodo) {
        sendPutRequest(`${TODO}/${todoId}`, {
          content: updateTodoContent,
          complete: curTodo.complete
        }, Cookies.get("token"))
          .then(res => {
            return res.json() as unknown as Todo
          })
          .then((data) => {
            const alteredTodos = todoList.todos.map(td => {
              if (td.id === todoId) {
                return data;
              }
              return td;
            })
            todoList.todos = alteredTodos;
            currentTodoList.set(todoList);
          })
          .catch(err => console.error(err))
      } else {
        console.error("something went wrong while updating todo")
      }
    } else {
      todoList.todos = alteredTodos;
      currentTodoList.set(todoList);
    }
    todoInEditMode = null;
  }

  // Delete Todo
  function handleDeleteTodo(id: number) {
    const alteredTodos = todoList.todos.filter(td => td.id !== id)
    if (!isDefaultTodoList(todoList)) {
      sendDeleteRequest(`${TODO}/${id}`, Cookies.get("token"))
        .then(async (res) => {
          await res.json().then(() => {
            todoList.todos = alteredTodos;
            currentTodoList.set(todoList);
          })
        })
        .catch(err => console.error(err))
    } else {
      todoList.todos = alteredTodos;
      currentTodoList.set(todoList);
    }

    todoInDeleteMode = null;
  }

  // Create Todo
	function createNewTodo() {
    if (newTodoContent.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("create-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }

    if (!isDefaultTodoList(todoList)) {
      sendPostRequest(
        `${API_URL}/api/todolist/${todoList.id}/todo`, {
          content: newTodoContent,
          complete: false
        }, Cookies.get("token"))
        .then(res => {
          return res.json() as unknown as Todo;
        })
        .then(data => {
          todoList.todos.push(data);
          currentTodoList.set(todoList);
        })
        .catch(err => {console.error(err)})
    } else {
      let highestId = 0;
      if (todoList.todos.length > 0) {
        const highestIdTodo = todoList.todos.reduce((max, current) => {
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

      todoList.todos.push(newTodo);
      currentTodoList.set(todoList);
    }

    inCreateMode = false;
    newTodoContent = "";
	}

  // Toggle todo completed
  function handleToggleComplete(id: number) {
    const alteredTodos = todoList.todos.map(td => {
      if (td.id === id) {
        td.complete = !td.complete
        return td
      }
      return td
    })

    if (!isDefaultTodoList(todoList)) {
      const currentTodo = todoList.todos.find(td => td.id === id)
      if (currentTodo) {
        sendPutRequest(`${TODO}/${id}`, {
          content: currentTodo.content,
          complete: !currentTodo.complete
        }, Cookies.get("token"))
          .then(async (res) => {
            await res.json()
            .then(() => {
              todoList.todos = alteredTodos;
              currentTodoList.set(todoList);
            })
          }).catch(err => console.error(err))
      } else {
        console.error("Something went wrong while toggling complete")
      }
    } else {
      todoList.todos = alteredTodos;
      currentTodoList.set(todoList);
    }
  }

  // Todolist title update
  function handleUpdateTodoListTitle(id: number) {
    if (updateTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-title-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }

    if (!isDefaultTodoList(todoList)) {
      const alteredTodoLists = todoListsStore.map(tl => {
        if (tl.id === id) {
          return todoList;
        }
        return tl;
      })
      sendPutRequest(`${TODOLIST}/${id}`, {
        title: updateTodoListTitle
      }, Cookies.get("token")).then(async (res) => {
          await res.json().then((data) => {
            todoList.title = updateTodoListTitle;
            currentTodoList.set(todoList);
            todoLists.set(alteredTodoLists);
            console.log(data);
          })
        }).catch((err) => console.error(err))
    } else {
      todoList.title = updateTodoListTitle;
      currentTodoList.set(todoList);
    }

    todoListTitleInEditMode = false;
  }

  // Save todolist to user todolists
  function handleSaveTodoList() {
    throw new Error("Function not implemented.");
  }
</script>

<div class="w-full h-full bg-gray-100 flex flex-col">
  {#if todoListTitleInEditMode}
    <div 
      class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <div class="flex justify-between" use:clickOutside on:click_outside={() => todoListTitleInEditMode = false}>
        <input 
          id="edit-title-input"
          class="bg-gray-200 m-[1px] pl-1"
          value={todoList.title}
          on:focusin={() => updateTodoListTitle = todoList.title}
          on:input={handleChangeTodoListTitle}
          use:focusOnElement />
          <div class="flex items-center">
            <button data-testid="todolist-edit-title-submit" on:click={() => handleUpdateTodoListTitle(todoList.id)}>
              <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
            </button>
            <button on:click={() => todoListTitleInEditMode = false}>
              <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
            </button>
          </div>
      </div>
    </div>
  {:else}
    <div class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
      <button data-testid="todolist-edit-title" class="relative top-2 left-[2px] mr-1" on:click={() => todoListTitleInEditMode = true}>
        <Icon class="w-[20px] h-[20px]" icon="tabler:edit" />
      </button>
      <h3 class="text-2xl font-bold">{stringShorten(todoList.title, 25)}</h3>
      <button class="ml-2" on:click={() => inCreateMode = true}>
        <Icon class="text-red-500 w-[20px] h-[20px]" icon="ph:plus-fill" />
      </button>
      {#if signedInStore && todoList.id === 0}
        <button on:click={handleSaveTodoList}>
          <Icon class="text-red-500 w-[20px] h-[20px]" icon="material-symbols:save" />
        </button>
      {/if}
    </div>
  {/if}
  <div class="w-full h-full flex justify-center border border-l-black bg-gray-200 overflow-y-scroll">
    <div class="h-full w-[400px] bg-gray-100">
      {#if todoList.todos}
        {#each todoList.todos as todo}
          <div class="w-full border border-b-gray-300">
            {#if todoInEditMode === todo.id}
              <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => todoInEditMode = null}>
                <div class="border border-b-black flex justify-between w-full">
                  <input 
                    id="edit-input"
                    class="bg-gray-200 m-[1px] pl-1 w-full"
                    value={todo.content}
                    on:focusin={() => updateTodoContent = todo.content}
                    on:input={handleChangeTodoTitle}
                    use:focusOnElement />
                </div>
                <div class="flex items-center">
                  <button on:click={() => handleUpdateTodo(todo.id)}>
                    <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
                  </button>
                  <button on:click={() => todoInEditMode = null}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                  </button>
                </div>
              </div>
              {:else if todoInDeleteMode === todo.id}
              <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => todoInDeleteMode = null}>
                <p class="text-red-500 font-bold">Delete this todo?</p>

                <div class="h-full w-[40px] flex items-center">
                  <button class="hover:cursor-pointer" on:click={() => handleDeleteTodo(todo.id)}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                  <button class="hover:cursor-pointer" on:click={() => todoInDeleteMode = null}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                  </button>
                </div>
              </div>
            {:else}
              <div class="mx-2 my-[1px] flex justify-between">
                {#if todo.complete}
                  <button class="w-full text-left line-through" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                {:else}
                  <button class="w-full text-left" on:click={() => handleToggleComplete(todo.id)}>{todo.content}</button>
                {/if}
                <div class="flex items-center">
                  <button class="hover:cursor-pointer" on:click={() => handleToggleComplete(todo.id)}>
                    <Icon icon="zondicons:checkmark" class="w-[20px] h-[20px]"/>
                  </button>
                  <button class="hover:cursor-pointer" on:click={() => todoInEditMode = todo.id}>
                    <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                  </button>
                  <button class="hover:cursor-pointer" on:click={() => todoInDeleteMode = todo.id}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      {/if}
      {#if inCreateMode} 
        <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={() => {inCreateMode = false}}>
          <div class="border border-b-black flex justify-between w-full">
            <input 
              id="create-input"
              class="bg-gray-200 m-[1px] pl-1 w-full"
              placeholder="new todo title"
              on:input={handleChangeNewTodoTitle}
              use:focusOnElement />
          </div>
          <div class="flex items-center">
            <button on:click={createNewTodo}>
              <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
            </button>
            <button on:click={() => inCreateMode = false}>
              <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
