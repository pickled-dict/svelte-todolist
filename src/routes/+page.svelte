<script lang="ts">
  import {signedIn} from "$lib/store"

  let isUserSignedIn: boolean;

  signedIn.subscribe((val) => {
    isUserSignedIn = val;
  })
</script>

<div class="text-center text-white">
  {#if isUserSignedIn}
    <p>Welcome, user!</p>
    {:else}
      <p>Not logged in</p>
  {/if}
</div>

