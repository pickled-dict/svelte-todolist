<script lang="ts">
  import UserTodoLists from "$lib/components/dashboard/UserTodoLists.svelte";
	import Dashboard from "$lib/components/dashboard/dashboard.svelte";
import {signedIn} from "$lib/store"

  let isUserSignedIn: boolean;

  signedIn.subscribe((val) => {
    isUserSignedIn = val;
  })
</script>

<div class="text-center text-white">
  {#if isUserSignedIn}
    <p>Welcome, user!</p>
    <Dashboard />
    {:else}
      <p>Not logged in</p>
  {/if}
</div>

