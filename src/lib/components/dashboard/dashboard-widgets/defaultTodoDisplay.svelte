<script lang="ts">
	import type { Todo } from "$lib/interfaces";
	import { stringShorten } from "$lib/utils";
	import Icon from "@iconify/svelte";

  export let todo: Todo;
  export let expandedList: number[];

	function handleTodoExpanded(id: number) {
    expandedList = [...expandedList, id]
	}

	function handleTodoCollapsed(id: number) {
    expandedList = expandedList.filter(todoId => id !== todoId)
	}
</script>


{#if todo.complete}
  <div class="relative">
    <div class="absolute left-[-14px] top-0">
      <Icon class="text-green-600 w-[20px] h-[20px]" icon="carbon:checkmark-filled" />
    </div>
  </div>
{/if}
{#if todo.content.length > 150}
  {#if expandedList.includes(todo.id)}
    <div class="relative">
      <button class="absolute right-[-10px] top-0 w-6 bg-gray-100 rounded-r-lg flex justify-end drop-shadow-lg" on:click={() => handleTodoCollapsed(todo.id)}>
        <Icon class="text-gray-800 w-[20px] h-[20px] mr-[1px]" icon="mdi:chevron-down" />
      </button>
    </div>
  {:else}
    <div class="relative">
      <button class="absolute right-[-10px] top-0 w-6 bg-gray-100 rounded-r-lg flex justify-end drop-shadow-lg" on:click={() => handleTodoExpanded(todo.id)}>
        <Icon class="text-gray-800 w-[20px] h-[20px] mr-[1px]" icon="mdi:chevron-left" />
      </button>
    </div>
  {/if}
{/if}
<div class="mx-2 flex flex-col">
  {#if todo.content.length > 150 && !expandedList.includes(todo.id)}
    <button data-testid="todo-content-not-complete" class="w-full text-left bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleTodoExpanded(todo.id)}>{stringShorten(todo.content, 150)}</button>
    {:else if expandedList.includes(todo.id)}
    <button data-testid="todo-content-not-complete" class="w-full text-left bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg" on:click={() => handleTodoCollapsed(todo.id)}>{todo.content}</button>
  {:else}
    <p data-testid="todo-content-not-complete" class="w-full text-left bg-gray-100 p-2 rounded-l-lg rounded-tr-lg drop-shadow-lg">{todo.content}</p>
  {/if}
  <div class="flex self-end ml-2 mb-2 bg-gray-100 rounded-b-lg pb-1 px-2 drop-shadow-lg">
    <!-- slot for options section -->
    <slot />
  </div>
</div>
