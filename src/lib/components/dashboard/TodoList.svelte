<script lang="ts">
  import { clickOutside } from "$lib/eventFunctions";
  import type { TodoList } from "$lib/interfaces";
  import { currentTodoList } from "$lib/store"
  import { focusOnElement, stringShorten } from "$lib/utils";
  import Icon from "@iconify/svelte";

  let todoList: TodoList;
  let inCreateMode = false;
  let todoInEditMode: null | number = null;
  let todoInDeleteMode: null | number = null;
  let updateTodoContent = "";
  let newTodoContent = "";

  function handleToggleComplete(id: number) {
    const alteredTodos = todoList.todos.map(td => {
      if (td.id === id) {
        td.complete = !td.complete
        return td
      }
      return td
    })

    todoList.todos = alteredTodos;
    currentTodoList.set(todoList);
  }

  function handleToggleEditTodo(id: number) {
    todoInEditMode = id;
  }

  function handleToggleDeleteTodo(id: number) {
    todoInDeleteMode = id;
  }

  function endUpdateMode() {
    todoInEditMode = null;
  }

  function endDeleteMode() {
    todoInDeleteMode = null;
  }

  function handleChangeTodoTitle(event: Event) {
    updateTodoContent = (<HTMLTextAreaElement> event.target).value;
  }

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

    todoList.todos = alteredTodos;
    currentTodoList.set(todoList);
    todoInEditMode = null;
  }

  function handleDeleteTodo(id: number) {
    const alteredTodos = todoList.todos.filter(td => td.id !== id)

    todoList.todos = alteredTodos;
    currentTodoList.set(todoList);
    todoInDeleteMode = null;
  }

  function handleChangeNewTodoTitle(event: Event) {
    newTodoContent = (<HTMLTextAreaElement> event.target).value;
  }

	function createNewTodo() {
    if (newTodoContent.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("create-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }

    const highestIdTodo = todoList.todos.reduce((max, current) => {
      if (current.id > max.id) {
        return current;
      }
      return max;
    })

    const newTodo = {
      id: highestIdTodo.id + 1,
      content: newTodoContent,
      complete: false
    }

    todoList.todos.push(newTodo);
    currentTodoList.set(todoList);
    inCreateMode = false;
    newTodoContent = "";
	}

  currentTodoList.subscribe((current) => {
    todoList = current;
  })
</script>

<div class="w-full h-full bg-gray-100 flex flex-col">
  <div class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
    <h3 class="text-2xl font-bold">{stringShorten(todoList.title, 25)}</h3>
    <button on:click={() => inCreateMode = true}>
      <Icon class="text-red-500 w-[30px] h-[30px]" icon="ph:plus-fill" />
    </button>
  </div>
  <div class="w-full h-full flex justify-center border border-l-black bg-gray-200 overflow-y-scroll">
    <div class="h-full w-[400px] bg-gray-100">
      {#each todoList.todos as todo}
        <div class="w-full border border-b-gray-300">
          {#if todoInEditMode === todo.id}
            <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={endUpdateMode}>
              <div class="border border-b-black flex justify-between w-full">
                <input 
                  id="edit-input"
                  class="bg-gray-200 m-[1px] pl-1 w-full"
                  value={todo.content}
                  on:input={handleChangeTodoTitle}
                  use:focusOnElement />
              </div>
              <div class="flex items-center">
                <button on:click={() => handleUpdateTodo(todo.id)}>
                  <Icon icon="ph:check-bold" class="w-[20px] h-[20px]" />
                </button>
                <button on:click={endUpdateMode}>
                  <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                </button>
              </div>
            </div>
          {:else if todoInDeleteMode === todo.id}
            <div class="mx-2 my-[1px] flex justify-between" use:clickOutside on:click_outside={endDeleteMode}>
              <p class="text-red-500 font-bold">Delete this todo?</p>

              <div class="h-full w-[40px] flex items-center">
                <button class="hover:cursor-pointer" on:click={() => handleDeleteTodo(todo.id)}>
                  <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                </button>
                <button class="hover:cursor-pointer" on:click={endDeleteMode}>
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
                <button class="hover:cursor-pointer" on:click={() => handleToggleEditTodo(todo.id)}>
                  <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                </button>
                <button class="hover:cursor-pointer" on:click={() => handleToggleDeleteTodo(todo.id)}>
                  <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
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
