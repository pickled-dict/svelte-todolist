<script lang="ts">
  let email = "";
  let password = "";
  let responseError = "";

  interface ErrorMessage {
    debugMessage: string,
    message: string,
    status: string,
    subErrors: Array<ErrorMessage> | null,
    timestamp: string
  };

  async function sendRequest() {
    fetch("http://localhost:8080/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      }),
    }).then(async (res) => {
        if (!res.ok) {
          const errorResponse: ErrorMessage = await res.json();
          throw new Error(errorResponse.message);
        }
        return res.json();
      }).then(data => {
        responseError = "";
        console.log(data)
      }).catch((err) => {

        if (!responseError.includes(err.message)) {
          responseError = err.message
        }

        console.error(err);
      });
  }

  $: {
    console.log(responseError)
  };

</script>

<div>
  <!-- Title container -->
  <div class="flex justify-center">
    <h1 class="text-6xl font-bold py-4 text-white">Todo App</h1>
  </div>

  <!-- Sign container -->
  <div class="flex justify-center py-4">
    <div class="w-[500px] h-[300px] bg-gray-700 flex justify-center items-center">
      <div class="w-[450px] h-[250px] bg-gray-300 flex justify-center items-center">
        <form class="p-2 w-[400px] h-[200px]">
          <div class="flex flex-col">
            <label class="font-bold text-lg" for="email">Email</label>
            <input class="max-w-[300px]" id="email" type="text" bind:value={email} />
          </div>
          <div class="flex flex-col">
            <label class="font-bold text-lg" for="password">Password</label>
            <input class="max-w-[300px]" id="password" type="password" bind:value={password} />
          </div>
          <div class="mt-3">
            <button type="submit" class="rounded-md bg-gray-800 text-white font-bold py-1 px-3" on:click={sendRequest}>Login</button>
          </div>
          {#if responseError.length > 0}
            <div class="mt-1 text-red-600 font-bold">
              {responseError}
            </div>
          {/if}
        </form>
      </div>
    </div>
  </div>
</div>

