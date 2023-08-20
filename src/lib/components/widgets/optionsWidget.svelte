<script lang="ts">
	import Icon from "@iconify/svelte";
  interface Option {
    tooltip: string,
    icon: string,
    callback: (...args: any[]) => void,
    testId?: string,
    submits?: boolean
  }
  export let options: Option[];
</script>

<div class="h-full w-[40px] flex items-center">
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
