<script lang="ts">
	import type { TodoList } from "$lib/interfaces";
  import {currentTodoList} from "$lib/store"

  let todoList: TodoList;

  currentTodoList.subscribe((current) => {
    todoList = current;
  })

  $: console.log(todoList);
</script>


<div class="w-full h-full bg-gray-100 flex flex-col">
  <div class="flex h-[63px] w-full justify-center items-center bg-gray-100 border border-b-black border-l-black">
    <h3 class="text-2xl font-bold">{todoList.title}</h3>
  </div>
  <div class="w-full h-full flex justify-center border border-l-black bg-gray-200 overflow-y-scroll">
    <div class="h-full w-[400px] bg-gray-100">
      {#each todoList.todos as todo}
        <div class="border border-b-gray-300">
          <div class="mx-2 my-[1px] ">
            <p>{todo.content}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
