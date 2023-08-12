<script lang="ts">
  export let label = "Input";
  export let id = "default";
  export let type = "text";
  export let value: string | number;
  export let blurred = false;
  export let inputErrors: Array<string>;

	function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target) {
      value = type.match(/^(number|range)$/) ? +target.value : target.value
    }
	}
</script>

<div class="flex flex-col">
  <label class="font-bold text-lg" for={id}>{label}</label>
  <input class="max-w-[300px]" {id} {type} {value} on:input={handleInput} on:blur={() => (blurred = true)} />
  <div class="mt-1 h-5">
    {#if blurred}
      {#each inputErrors.slice(0, 1) as err}
        <div data-testid="input-error" class="text-red-600 text-sm">
          {err}
        </div>
      {/each}
    {/if}
  </div>
</div>
