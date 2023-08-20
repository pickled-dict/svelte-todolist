<script lang="ts">
	import Toast from "./toast.svelte";
  import { dismissToast } from "$lib/utils";
  import { toasts } from "$lib/store";
</script>

{#if $toasts}
  <div class="absolute top-2">
    {#each $toasts as toast (toast.id)}
      <Toast
        dismissable={toast.dismissable}
        type={toast.type}
        on:dismiss-toast={() => dismissToast(toast.id)}
      >{toast.message}</Toast>
    {/each}
  </div>
{/if}
