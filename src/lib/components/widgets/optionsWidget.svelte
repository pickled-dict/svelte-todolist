<script lang="ts">
	import Icon from "@iconify/svelte";
  import type {ButtonOptions} from "$lib/interfaces";

  export let options: ButtonOptions[];
</script>

<div class="flex items-center">
  {#each options as option}
    {#if option.submits && option.testId === null}
      <button type="submit" title={option.tooltip} class="hover:cursor-pointer" on:click={option.callback}>
        <Icon icon={option.icon} class="w-[20px] h-[20px]" />
      </button>
    {:else if option.submits && option.testId}
      <button data-testid={option.testId} type="submit" title={option.tooltip} class="hover:cursor-pointer" on:click={option.callback}>
        <Icon icon={option.icon} class="w-[20px] h-[20px]" />
      </button>
    {:else if !option.submits && option.testId}
      <button data-testid={option.testId} title={option.tooltip} class="hover:cursor-pointer" on:click={option.callback}>
        <Icon icon={option.icon} class="w-[20px] h-[20px]" />
      </button>
    {:else}
      <button title={option.tooltip} class="hover:cursor-pointer" on:click={option.callback}>
        <Icon icon={option.icon} class="w-[20px] h-[20px]" />
      </button>
    {/if}
  {/each}
</div>
