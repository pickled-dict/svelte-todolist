<script lang="ts">
  import { signedIn } from "$lib/store"
  import { naturalSignout } from "$lib/utils"
  import "../app.css"
	import Toasts from "$lib/components/widgets/toasts.svelte";

  let isSignedIn: boolean;

  function handleLogoutClicked() {
    naturalSignout();
  }

  signedIn.subscribe((val) => {
    isSignedIn = val;
  })
</script>

<!-- Title container -->
<div class="flex justify-center">
  <Toasts />
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
