<script lang="ts">
  export let text = "button";
  export let action: () => void;
  export let disabled: boolean;
</script>

<div class="mt-2">
  <button 
    type="submit"
    class="rounded-md bg-gray-800 text-white font-bold py-1 px-3 disabled:opacity-50"
    on:click={action}
    {disabled}>
    {text}
  </button>
</div>
