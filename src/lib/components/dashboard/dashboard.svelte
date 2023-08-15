<script>
	import TodoList from "./TodoList.svelte";
  import UserTodoLists from "./UserTodoLists.svelte";

</script>
<div class="flex justify-center">
  <div class="w-[800px] h-[500px] border-black border-2">
    <div class="flex justify-between h-full">
      <UserTodoLists />
      <TodoList />
    </div>
  </div>
</div>
