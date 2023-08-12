<script lang="ts">
  export let label = "Input";
  export let id = "default";
  export let bindData: string;
  export let blurred = false;
  export let inputErrors: Array<string>;

</script>

<div class="flex flex-col">
  <label class="font-bold text-lg" for={id}>{label}</label>
  <input class="max-w-[300px]" {id} type="text" bind:value={bindData} on:blur={() => (blurred = true)} />
  {#if blurred}
    {#each inputErrors.slice(0, 1) as err}
      <div class="text-red-600 font-bold">
        {err}
      </div>
    {/each}
  {/if}
</div>
