<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import { TODOLIST, sendDeleteRequest, sendPostRequest, sendPutRequest } from "$lib/fetchRequests";
  import { signedIn, todoLists, currentTodoList, defaultTodoList } from "$lib/store";
  import type { TodoList } from "$lib/interfaces";
  import { clickOutside } from "$lib/eventFunctions";
	import { focusOnElement, stringShorten } from "$lib/utils";

  let isSignedIn: boolean;
  let isTodoListsLoaded: boolean;
  let createTodoListTitle = "";
  let updateTodoListTitle:string;
  let inCreateMode = false;
  let todoListInEditMode: null | number = null;
  let todoListInDeleteMode: null | number = null;
  let todoListsStore: Array<TodoList>;
  let currentTodoListStore: TodoList;

  function endCreateMode() {
    inCreateMode = false;
  }

  function endUpdateMode() {
    todoListInEditMode = null;
  }

  function endDeleteMode() {
    todoListInDeleteMode = null;
  }

  function handleCreateTodoList() {
    if (createTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("create-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }
    sendPostRequest(TODOLIST, {title: createTodoListTitle}, Cookies.get("token"))
      .then((res) => {
        inCreateMode = false;
        return res.json() as unknown as TodoList
      })
      .then((todoList) => {
        console.log(todoList);
        todoLists.set([...todoListsStore, todoList])
        todoList.todos = [];
        currentTodoList.set(todoList)
        createTodoListTitle = ""
      }).catch((err) => {
        console.error(err);
      })
  }

  function handleSelectForEdit(todoListId: number): void {
    todoListInEditMode = todoListId;
  }

  function handleChangeTodoListTitle(event: Event) {
    updateTodoListTitle = (<HTMLTextAreaElement> event.target).value;
  }

  function handleUpdateTodoList(todoListId: number) {
    if (updateTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }
    sendPutRequest(TODOLIST + `/${todoListId}`, {title: updateTodoListTitle}, Cookies.get("token"))
      .then((res) => {
        endUpdateMode();
        return res.json() as unknown as TodoList
      })
      .then((todoList) => {
        updateTodoListTitle = ""
        const updatedTodoList = todoListsStore.map((tl) => {
          if (tl.id === todoList.id) {
            return todoList;
          }
          return tl;
        })
        todoLists.set(updatedTodoList);
      }).catch((err) => {
        console.error(err);
      })
  }

  function handleSelectForDelete(todoListId: number) {
    todoListInDeleteMode = todoListId;
  }

  function confirmDelete(todoListId: number) {
    sendDeleteRequest(TODOLIST + `/${todoListId}`, Cookies.get("token"))
      .then(() => {
        endDeleteMode();
        const updatedTodoLists = todoListsStore.filter((tl) => tl.id !== todoListId)
        todoLists.set(updatedTodoLists);
        todoListInDeleteMode = null;

        if (currentTodoListStore.id === todoListId) {
          const selectedTodoList = todoListsStore.at(0);
          if (selectedTodoList) {
            currentTodoList.set(selectedTodoList)
          } else {
            currentTodoList.set(structuredClone(defaultTodoList))
          }
        }

      }).catch((err) => {
        console.error(err);
      })
  }

	function handleTodoListSelected(todoListId: number) {
    const selected = todoListsStore.find((tl) => tl.id === todoListId)
    if (selected) {
      currentTodoList.set(selected)
    }
	}

  todoLists.subscribe((todoLists) => {
    todoListsStore = todoLists;
  })

  signedIn.subscribe((val) => {
    isSignedIn = val;
  })

  currentTodoList.subscribe(curTodoList => {
    currentTodoListStore = curTodoList;
  })

  beforeUpdate(() => {
    isTodoListsLoaded = true;
  })

  onMount(() => {
    isTodoListsLoaded = false;
  })
</script>

<div class="bg-gray-100 w-[450px] text-black">
  <div class="flex h-14 bg-gray-100 border border-b-black justify-between">
    <div class="flex items-center ml-2">
      <h3 class="text-2xl font-bold">Your TodoLists</h3>
    </div>
    <div class="flex items-end">
      <button 
        class="bg-red-500 h-8 w-8 m-1 rounded-full flex justify-center items-center hover:cursor-pointer"
        on:click={() => inCreateMode = true}>
        <Icon class="text-white h-7 w-7" icon="mingcute:add-line" />
      </button>
    </div>
  </div>
  <div class="flex">
    <div class="flex flex-col items-start w-full">
      {#if isSignedIn}
        {#if isTodoListsLoaded}
          {#each todoListsStore as tl}
            {#if tl.id === todoListInEditMode}
              <div class="border border-b-black flex justify-between w-full" use:clickOutside on:click_outside={endUpdateMode}>
                <div class="flex items-center">
                  <input 
                    id="edit-input"
                    class="bg-gray-200 m-[1px] pl-1 w-full"
                    value={tl.title}
                    on:focusin={() => updateTodoListTitle = tl.title}
                    on:input={handleChangeTodoListTitle}
                    use:focusOnElement />
                </div>
                <div class="flex items-center ">
                  <button on:click={() => handleUpdateTodoList(tl.id)}>
                    <Icon icon="ph:check-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
                  </button>
                  <button on:click={endUpdateMode}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
                  </button>
                </div>
              </div>
              {:else if todoListInDeleteMode === tl.id}
              <div class="border border-b-black flex justify-between w-full" use:clickOutside on:click_outside={endDeleteMode}>
                <p class="ml-1 my-[1px] text-red-500 font-bold">Delete this todolist?</p>
                <div class="h-full w-[40px] flex items-center">
                  <button class="hover:cursor-pointer" on:click={() => confirmDelete(tl.id)}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                  <button class="hover:cursor-pointer" on:click={endDeleteMode}>
                    <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                  </button>
                </div>
              </div>
            {:else}
              <div class="border border-b-black w-full flex justify-between bg-gray-200">
                <button class="ml-1 my-[1px] w-full hover:cursor-pointer text-left" on:click={() => handleTodoListSelected(tl.id)}>
                  {stringShorten(tl.title, 25)}
                </button>
                <div class="h-full w-[40px] flex items-center">
                  <button class="hover:cursor-pointer" on:click={() => handleSelectForEdit(tl.id)}>
                    <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                  </button>
                  <button class="hover:cursor-pointer" on:click={() => handleSelectForDelete(tl.id)}>
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        {:else}
          <div class="mt-10 w-full flex justify-center">
            <img class="animate-spin w-[40px] h-[40px]" src="spinner-rotate-forward.svg" alt="spinner">
          </div>
        {/if}
      {:else}
        <p>Sign in to view saved todolists!</p>
      {/if}
      {#if inCreateMode}
        <div class="border border-b-black w-full" use:clickOutside on:click_outside={endCreateMode}>
          <div class="flex justify-between">
            <div class="flex items-center">
              <input 
                id="create-input"
                placeholder="new todolist title"
                class="bg-gray-200 w-full m-[1px] pl-1"
                bind:value={createTodoListTitle}
                use:focusOnElement />
            </div>
            <div class=" flex items-center mr-[1px]">
              <button class="leading-0" on:click={handleCreateTodoList}>
                <Icon icon="ph:check-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
              </button>
              <button class="leading-0" on:click={endCreateMode}>
                <Icon icon="ph:x-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
