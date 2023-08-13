<script lang="ts">
	import { onMount } from "svelte";
  import Icon from "@iconify/svelte";
  import Cookies from "js-cookie";
  import { TODOLIST, sendGetRequest } from "$lib/fetchRequests";
  import { signedIn } from "$lib/store";
  
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

  let isSignedIn: boolean;
  let inEditMode = false;
  let todoLists: Array<TodoList> = [];

  function stringShorten(s: string, to: number) {
    if (s.length > to) {
      return s.slice(0, to) + "..."
    }
    return s
  }

  function initEditMode(el: HTMLElement) {
    el.focus()
  }

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

  function endEditMode() {
    inEditMode = false;
  }

  signedIn.subscribe((val) => {
    isSignedIn = val;
  })

  onMount(async () => {
    if (isSignedIn) {
      await sendGetRequest(TODOLIST + "/all", Cookies.get("token"))
      .then((res) => res.json() as unknown as Array<TodoList>)
      .then((data) => {
        todoLists = data;
      })
      .catch((err) => console.error(err))
    }
  })

</script>

<div class="bg-gray-200 w-[250px] text-black">
  <div class="flex h-14 bg-gray-100 border border-b-black justify-between">
    <div class="flex items-center ml-2">
      <h3 class="text-2xl font-bold">Your TodoLists</h3>
    </div>
    <div class="flex items-end">
      <button 
        class="bg-red-500 h-8 w-8 m-1 rounded-full flex justify-center items-center hover:cursor-pointer"
        on:click={() => inEditMode = true}
      >
        <Icon class="text-white h-7 w-7" icon="mingcute:add-line" />
      </button>
    </div>
  </div>
  <div class="flex">
    <div class="flex flex-col items-start w-full">
      {#if isSignedIn}
      {#each todoLists as tl }
          <div class="border border-b-black w-full flex justify-between">
            <p class="ml-1 my-[1px]">{stringShorten(tl.title, 25)}</p>
            <div class="h-full w-[40px] flex items-center">
              <Icon icon="mingcute:edit-2-line"  class="w-[25px] h-[25px] hover:cursor-pointer"/>
              <Icon icon="mingcute:delete-2-line" class="w-[25px] h-[25px] hover:cursor-pointer" />
            </div>
          </div>
      {/each}
      {:else}
        <p>Sign in to view saved todolists!</p>
      {/if}
      {#if inEditMode}
        <div class="border border-b-black w-full">
          <div class="flex justify-between">
            <div class="flex items-center">
              <input 
                id="edit-input"
                placeholder="new todolist title"
                class="bg-gray-200 w-full m-[1px] pl-1"
                use:clickOutside
                on:click_outside={endEditMode}
                use:initEditMode />
            </div>
            <div class="h-full flex items-center mr-[1px]">
              <Icon icon="ph:check-bold" class="w-[20px] h-[20px] hover:cursor-pointer"/>
              <Icon icon="ph:x-bold" class="w-[20px] h-[20px] hover:cursor-pointer" on:click={endEditMode} />
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
