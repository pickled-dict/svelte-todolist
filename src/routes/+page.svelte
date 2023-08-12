<script lang="ts">
  import { z } from "zod";
  import {sendRequest} from "$lib/fetchRequests"
	import type { ErrorMessage } from "$lib/interfaces";

  interface FormError {
    field: string|number,
    message: string
  }

  const signInFormSchema = z.object({
    email: z.string().email().nonempty(),
    password: z.string().nonempty()
  })

  const signInData = {
    email: "",
    password: ""
  }

  let responseError = "";

  let emailErrors: Array<string> = []
  let passwordErrors: Array<string> = []

  let emailInputBlurred = false;
  let passwordInputBlurred = false;

  let buttonDisabled = true;

  // zod
  async function signinRequest() {
    const {email, password} = signInData;
    await sendRequest({email, password}, "POST")
      .then(async (res) => {
        if (!res.ok) {
          const errorResponse: ErrorMessage = await res.json();
          throw new Error(errorResponse.message);
        }
        return res.json();
      })
      .then(data => {
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
    const parsed = signInFormSchema.safeParse(signInData)
    let errors: Array<FormError> = [];

    if (!parsed.success) {
      errors = parsed.error.errors.map((error) => {
        return {
          field: error.path[0],
          message: error.message
        };
      });
    }

    emailErrors = errors.filter((formErr) => formErr.field === "email").map((err) => err.message);
    passwordErrors = errors.filter((formErr) => formErr.field === "password").map((err) => err.message);
    buttonDisabled = emailErrors.length > 0 || passwordErrors.length > 0;
  }
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
            <input class="max-w-[300px]" id="email" type="text" bind:value={signInData.email} on:blur={() => (emailInputBlurred = true)} />

            {#if emailInputBlurred}
              {#each emailErrors.slice(0, 1) as err}
                <div class="text-red-600 font-bold">
                  {err}
                </div>
              {/each}
            {/if}
          </div>
          <div class="flex flex-col">
            <label class="font-bold text-lg" for="password">Password</label>
            <input class="max-w-[300px]" id="password" type="password" bind:value={signInData.password} on:blur={() => (passwordInputBlurred = true)}/>
            {#if passwordInputBlurred}
              {#each passwordErrors.slice(0, 1) as err}
                <div class="text-red-600 font-bold">
                  {err}
                </div>
              {/each}
            {/if}
          </div>
          <div class="mt-3">
            <button 
              type="submit"
              class="rounded-md bg-gray-800 text-white font-bold py-1 px-3 disabled:opacity-50"
              on:click={signinRequest}
              disabled={buttonDisabled}
              >
              Login
            </button>
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

