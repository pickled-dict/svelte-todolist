<script lang="ts">
	import { TODOLIST, sendGetRequest } from "$lib/fetchRequests";
	import { onMount } from "svelte";
  import { signedIn } from "$lib/store";
  import Cookies from "js-cookie";
  
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
  <div class="flex justify-start p-2 pl-3 bg-gray-100">
    <h3 class="text-2xl font-bold">Your TodoLists</h3>
  </div>
  <div class="flex">
    <div class="ml-2 flex flex-col items-start">
      {#if isSignedIn}
      {#each todoLists as tl }
          <p>{stringShorten(tl.title, 30)}</p>
      {/each}
      {:else}
        <p>Sign in to view saved todolists!</p>
      {/if}
    </div>
  </div>
</div>
