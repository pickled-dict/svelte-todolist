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
  let todoLists: Array<TodoList> = [];

  function stringShorten(s: string, to: number) {
    if (s.length > to) {
      return s.slice(0, to) + "..."
    }
    return s
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
      <div class="bg-red-500 h-8 w-8 m-1 rounded-full flex justify-center items-center hover:cursor-pointer">
        <Icon class="text-white h-7 w-7" icon="mingcute:add-line" />
      </div>
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
    </div>
  </div>
</div>
