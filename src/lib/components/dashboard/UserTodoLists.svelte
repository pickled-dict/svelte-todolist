<script lang="ts">
  import { beforeUpdate, onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import type { TodoList } from "$lib/interfaces";
  import { sendDeleteRequest, sendPostRequest, sendPutRequest } from "$lib/fetchRequests";
  import { signedIn, todoLists, currentTodoList } from "$lib/store";
  import { clickOutside } from "$lib/eventFunctions";
  import { focusOnElement, stringShorten, defaultTodoList } from "$lib/utils";
  import { TODOLIST_ROUTE } from "$lib/constants";


  // === local state
  let isTodoListsLoaded: boolean;
  let createTodoListTitle = "";
  let updateTodoListTitle:string;
  let inCreateTodoListMode = false;
  let todoListInEditMode: null | number = null;
  let todoListInDeleteMode: null | number = null;

  // subscriber variables
  let currentTodoListStore: TodoList;
  let todoListsStore: Array<TodoList>;
  let isSignedInStore: boolean;

  // === subscription functions for svelte store
  todoLists.subscribe((todoLists) => {
    todoListsStore = todoLists;
  })

  signedIn.subscribe((val) => {
    isSignedInStore = val;
  })

  currentTodoList.subscribe(curTodoList => {
    currentTodoListStore = curTodoList;
  })

  // === util functions
  // upon selection of a todolist, global store is updated
  function handleTodoListSelected(todoListId: number) {
    const selected = todoListsStore.find((tl) => tl.id === todoListId)
    if (selected) {
      currentTodoList.set(selected)
    }
  }

  // casting event.target to HTMLTextAreaElement to access value property
  function handleChangeTodoListTitle(event: Event) {
    updateTodoListTitle = (<HTMLTextAreaElement> event.target).value;
  }

  // === handler functions for extended logic (fetch requests)
  function confirmCreateTodoList() {
    if (createTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("create-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }
    sendPostRequest(TODOLIST_ROUTE, {title: createTodoListTitle}, Cookies.get("token"))
      .then((res) => {
        inCreateTodoListMode = false;
        return res.json() as unknown as TodoList
      })
      .then((todoList) => {
        todoLists.set([...todoListsStore, todoList])
        todoList.todos = [];
        currentTodoList.set(todoList)
        createTodoListTitle = ""
      }).catch((err) => {
        console.error(err);
      })
  }

  function confirmUpdateTodoList(todoListId: number) {
    if (updateTodoListTitle.length === 0) {
      alert("cannot be empty");
      const el = document.getElementById("edit-input");
      if (el !== null) {
        focusOnElement(el)
      }
      return;
    }
    sendPutRequest(TODOLIST_ROUTE + `/${todoListId}`, {title: updateTodoListTitle}, Cookies.get("token"))
      .then((res) => {
        todoListInEditMode = null;
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

  function confirmDeleteTodoList(todoListId: number) {
    sendDeleteRequest(TODOLIST_ROUTE + `/${todoListId}`, Cookies.get("token"))
      .then(() => {
        todoListInDeleteMode = null;
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

  // === lifetime functions for handling whether todolists are loaded or not
  beforeUpdate(() => {
    isTodoListsLoaded = true;
  })

  onMount(() => {
    isTodoListsLoaded = false;
  })
</script>

<div class="bg-gray-100 w-[450px] text-black">
  <!-- TodoLists Title Block -->
  <div class="flex h-14 bg-gray-100 border border-b-black justify-between">
    <div class="flex items-center ml-2">
      <h3 class="text-2xl font-bold">Your TodoLists</h3>
    </div>
    <div class="flex items-end">
      <button 
        class="bg-red-500 h-8 w-8 m-1 rounded-full flex justify-center items-center hover:cursor-pointer"
        on:click={() => inCreateTodoListMode = true}>
        <Icon class="text-white h-7 w-7" icon="mingcute:add-line" />
      </button>
    </div>
  </div>
  <!-- Main TodoList Container Block -->
  <div class="flex">
    <div class="flex flex-col items-start w-full">
      <!-- If signed in, continue, else show "Login to view saved todolists" -->
      {#if isSignedInStore}
        <!-- If todolists aren't loaded in state, show spinner, else continue -->
        {#if isTodoListsLoaded}
          <!-- if todoLists is empty and not in create mode, display "please add a todolist", else continue -->
          {#if todoListsStore.length === 0 && !inCreateTodoListMode}
            <p class="m-2">You have no saved todos! press the "+" button above to make some!</p>
          {:else}
            <!-- If all conditions met, show todolists -->
            {#each todoListsStore as tl}
              <!-- If todolist selected for edit do: -->
              {#if tl.id === todoListInEditMode}
                <div class="border border-b-black flex justify-between w-full" use:clickOutside on:click_outside={() => todoListInEditMode = null}>
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
                    <button on:click={() => confirmUpdateTodoList(tl.id)}>
                      <Icon icon="ph:check-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
                    </button>
                    <button on:click={() => todoListInEditMode = null}>
                      <Icon icon="ph:x-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
                    </button>
                  </div>
                </div>
                <!-- If todolist selected for delete do: -->
                {:else if todoListInDeleteMode === tl.id}
                <div class="border border-b-black flex justify-between w-full" use:clickOutside on:click_outside={() => todoListInDeleteMode = null}>
                  <p class="ml-1 my-[1px] text-red-500 font-bold">Delete this todolist?</p>
                  <div class="h-full w-[40px] flex items-center">
                    <button class="hover:cursor-pointer" on:click={() => confirmDeleteTodoList(tl.id)}>
                      <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                    </button>
                    <button class="hover:cursor-pointer" on:click={() => todoListInDeleteMode = null}>
                      <Icon icon="ph:x-bold" class="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>
                <!-- else display in its default state -->
              {:else}
                <div class="border border-b-black w-full flex justify-between bg-gray-200">
                  <button class="ml-1 my-[1px] w-full hover:cursor-pointer text-left" on:click={() => handleTodoListSelected(tl.id)}>
                    {stringShorten(tl.title, 25)}
                  </button>
                  <div class="h-full w-[40px] flex items-center">
                    <button class="hover:cursor-pointer" on:click={() => todoListInEditMode = tl.id}>
                      <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                    </button>
                    <button class="hover:cursor-pointer" on:click={() => todoListInDeleteMode = tl.id}>
                      <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                    </button>
                  </div>
                </div>
              {/if}
            {/each}
          {/if}
        {:else}
          <div class="mt-10 w-full flex justify-center">
            <img class="animate-spin w-[40px] h-[40px]" src="spinner-rotate-forward.svg" alt="spinner">
          </div>
        {/if}
      {:else}
        <p class="m-2">Sign in to view saved todolists!</p>
      {/if}
      <!-- Create TodoList Logic -->
      {#if inCreateTodoListMode}
        <div class="border border-b-black w-full" use:clickOutside on:click_outside={() => inCreateTodoListMode = false}>
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
              <button class="leading-0" on:click={confirmCreateTodoList}>
                <Icon icon="ph:check-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
              </button>
              <button class="leading-0" on:click={() => inCreateTodoListMode = false}>
                <Icon icon="ph:x-bold" class="w-[20px] h-[20px] hover:cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
