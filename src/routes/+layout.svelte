<script lang="ts">
  import Cookies from "js-cookie"
  import { signedIn, currentTodoList } from "$lib/store"
  import { defaultTodoList } from "$lib/utils"
  import "../app.css"

  let isSignedIn: boolean;

  function handleLogoutClicked() {
    Cookies.remove('token');
    signedIn.set(false);
    currentTodoList.set(structuredClone(defaultTodoList));
  }

  signedIn.subscribe((val) => {
    isSignedIn = val;
  })
</script>

<!-- Title container -->
<div class="flex justify-center">
  <h1 class="text-6xl font-bold py-4 text-white">Todo App</h1>
</div>
<div class="flex justify-center mb-3">
  <div class="flex gap-1 text-lg text-white font-bold">
    <a class="underline" href="/">Home</a>
    {#if isSignedIn}
      <span>|</span>
      <button class="underline" on:click={handleLogoutClicked}>Logout</button>
      {:else}
      <span>|</span>
      <a class="underline" href="/login">Login</a>
      <span>|</span>
      <a class="underline" href="/signup">Sign Up</a>
    {/if}
  </div>
</div>
<slot />
