<script lang="ts">
	import type { ToastTypes } from "$lib/interfaces";
  import Icon from "@iconify/svelte";
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";

  const dispatch = createEventDispatcher();

  export let type: ToastTypes = "INFO";
  export let dismissable = true;

  function colorParserByToastType(type: ToastTypes) {
    if (type === "INFO") {
      return "bg-green-400"
    }

    if (type === "WARN") {
      return "bg-yellow-400"
    }

    if (type === "ERROR") {
      return "bg-red-400"
    }
  }
</script>

<div class={`${colorParserByToastType(type)} flex p-2 rounded-lg`} role="alert" transition:fade>
  <div>
    <slot />
  </div>

  {#if dismissable}
    <button class="ml-1" on:click={() => dispatch("dismiss-toast")}>
      <Icon icon="ph:x-fill" />
    </button>
  {/if}
</div>
