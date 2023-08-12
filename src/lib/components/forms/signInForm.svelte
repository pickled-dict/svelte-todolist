<script lang="ts">
  import { z } from "zod";
  import {sendRequest} from "$lib/fetchRequests"
  import type { FormError } from "$lib/interfaces";
  import FormInput from "../widgets/formInput.svelte";
	import SubmitButton from "../widgets/submitButton.svelte";

  interface SignInErrors {
    email: Array<string>,
    password: Array<string>,
    responseError: string
  };

  let emailInputBlurred = false;
  let passwordInputBlurred = false;
  let buttonDisabled = true;

  const signInFormSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty({message: "Password must have at least 1 character"})
  })

  const errors: SignInErrors = {
    email: [],
    password: [],
    responseError: ""
  }

  const signInData = {
    email: "",
    password: "",
  }

  async function signinRequest() {
    const {email, password} = signInData;
    await sendRequest({email, password}, "POST")
    .then(async (res) => {
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      return res.json();
    })
    .then(data => {
      errors.responseError = "";
      console.log(data)
    }).catch((err) => {
      if (!errors.responseError.includes(err.message)) {
        errors.responseError = err.message
      }
      console.error(err);
    });
  }

  $: {
    const parsed = signInFormSchema.safeParse(signInData)
    let parsedErrors: Array<FormError> = [];

    if (!parsed.success) {
      parsedErrors = parsed.error.errors.map((error) => {
        return {
          field: error.path[0],
          message: error.message
        };
      });
    }

    errors.email = parsedErrors.filter((formErr) => formErr.field === "email").map((err) => err.message);
    errors.password = parsedErrors.filter((formErr) => formErr.field === "password").map((err) => err.message);
    buttonDisabled = errors.email.length > 0 || errors.password.length > 0;
  }
</script>

<div class="flex justify-center py-4">
  <div class="w-[500px] h-[300px] bg-gray-700 flex justify-center items-center">
    <div class="w-[450px] h-[250px] bg-gray-300 flex justify-center items-center">
      <form class="p-2 w-[400px] h-[200px]">
          <FormInput 
            label="Email"
            id="email"
            bind:bindData={signInData.email}
            bind:blurred={emailInputBlurred}
            inputErrors={errors.email}
          />
          <FormInput
            label="Password"
            id="password"
            bind:bindData={signInData.password}
            bind:blurred={passwordInputBlurred}
            inputErrors={errors.password} />
          <SubmitButton disabled={buttonDisabled} action={signinRequest} text="Login" />
        {#if errors.responseError.length > 0}
          <div class="mt-1 text-red-600 font-bold">
            {errors.responseError}
          </div>
        {/if}
      </form>
    </div>
  </div>
</div>
