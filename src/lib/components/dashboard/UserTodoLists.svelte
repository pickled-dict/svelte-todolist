<script lang="ts">
  import { onMount } from "svelte";
  import Icon, {loadIcons} from "@iconify/svelte";
  import Cookies from "js-cookie";
  import { TODOLIST, sendGetRequest, sendPostRequest, sendPutRequest } from "$lib/fetchRequests";
  import { signedIn } from "$lib/store";

  loadIcons(["mingcute:add-line", "fontisto:spinner-rotate-forward"])

  interface Todo {
    id: number,
    content: string,
    complete: boolean
  }

  interface TodoList {
    id: number,
    title: string,
    todos: Array<Todo>
  }

  interface MessageResponse {
    message: string,
  }

  let isSignedIn: boolean;
  let isTodoListsLoaded: boolean;
  let createTodoListTitle = "";
  let updateTodoListTitle:string;
  let inCreateMode = false;
  let todoListInEditMode: null | number = 4;
  let todoLists: Array<TodoList> = [];

  function stringShorten(s: string, to: number) {
    if (s.length > to) {
      return s.slice(0, to) + "..."
    }
    return s
  }

  function focusOnElement(el: HTMLElement) {
    el.focus()
  }

  // the mouse drag bug happens here, revisit
  function clickOutside(node: any) {
    const handleClick = (event: Event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented && node !== null) {
        node.dispatchEvent(
          new CustomEvent('click_outside')
        )
      }
    }

    document.addEventListener('click', handleClick, true);

    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    }
  }

  function endCreateMode() {
    inCreateMode = false;
  }

  function endUpdateMode() {
    todoListInEditMode = null;
  }

  signedIn.subscribe((val) => {
    isSignedIn = val;
  })

  onMount(() => {
    loadIcons(["mingcute:add-line", "fontisto:spinner-rotate-forward"])
    isTodoListsLoaded = false;
    if (isSignedIn) {
      sendGetRequest(TODOLIST + "/all", Cookies.get("token"))
        .then((res) => res.json() as unknown as Array<TodoList>)
        .then((data) => {
          todoLists = data;
          isTodoListsLoaded = true;
        })
        .catch((err) => console.error(err))
    }
  })

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
        return res.json() as unknown as MessageResponse
      })
      .then(() => {
        // revisit, a lot of repeated code
        isTodoListsLoaded = false;
        sendGetRequest(TODOLIST + "/all", Cookies.get("token"))
          .then((res) => res.json() as unknown as Array<TodoList>)
          .then((data) => {
            todoLists = data;
            isTodoListsLoaded = true;
          })
          .catch((err) => console.error(err))
        createTodoListTitle = ""
      }).catch((err) => {
        console.error(err);
      })
  }

  function handleSelectTodolist(todoListId: number): void {
    todoListInEditMode = todoListId;
  }

  function handleChangeTodoListTitle(event: Event) {
    updateTodoListTitle = (<HTMLTextAreaElement> event.target).value;
    console.log(updateTodoListTitle);
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
      .then(() => {
        isTodoListsLoaded = false;

        // revisit, a lot of repeated code
        sendGetRequest(TODOLIST + "/all", Cookies.get("token"))
          .then((res) => res.json() as unknown as Array<TodoList>)
          .then((data) => {
            todoLists = data;
            isTodoListsLoaded = true;
          })
          .catch((err) => console.error(err))
        updateTodoListTitle = ""
      }).catch((err) => {
        console.error(err);
      })
  }
</script>

<div class="bg-gray-200 w-[250px] text-black">
  <div class="flex h-14 bg-gray-100 border border-b-black justify-between">
    <div class="flex items-center ml-2">
      <h3 class="text-2xl font-bold">Your TodoLists</h3>
    </div>
    <div class="flex items-end">
      <button 
        class="bg-red-500 h-8 w-8 m-1 rounded-full flex justify-center items-center hover:cursor-pointer"
        on:click={() => inCreateMode = true}
      >
        <Icon class="text-white h-7 w-7" icon="mingcute:add-line" />
      </button>
    </div>
  </div>
  <div class="flex">
    <div class="flex flex-col items-start w-full">
      {#if isSignedIn}
        {#if isTodoListsLoaded}
          {#each todoLists as tl}
            {#if tl.id === todoListInEditMode}
              <div class="border border-b-black flex justify-between w-full" use:clickOutside on:click_outside={endUpdateMode}>
                <div class="flex items-center">
                  <input 
                    id="edit-input"
                    class="bg-gray-200 m-[1px] pl-1 w-full"
                    value={tl.title}
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
            {:else}
              <div class="border border-b-black w-full flex justify-between">
                <p class="ml-1 my-[1px]">{stringShorten(tl.title, 25)}</p>
                <div class="h-full w-[40px] flex items-center">
                  <button class="hover:cursor-pointer" on:click={() => handleSelectTodolist(tl.id)}>
                    <Icon icon="mingcute:edit-2-line" class="w-[20px] h-[20px]" />
                  </button>
                  <button class="hover:cursor-pointer">
                    <Icon icon="mingcute:delete-2-line" class="w-[20px] h-[20px]"/>
                  </button>
                </div>
              </div>
            {/if}
          {/each}
        {:else}
          <div class="flex justify-center items-center w-full h-[375px]">
            <img class="w-[40px] h-[40px] animate-spin fill-red-800" alt="spinner" src="/spinner-rotate-forward.svg" />
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
