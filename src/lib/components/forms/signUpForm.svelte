<script lang="ts">
	import { z } from "zod";
	import FormInput from "../widgets/formInput.svelte";
	import type { FormError, MessageResponse } from "$lib/interfaces";
	import SubmitButton from "../widgets/submitButton.svelte";
	import { sendPostRequest } from "$lib/fetchRequests";
	import { AUTH_ROUTE } from "$lib/constants";
	import { goto } from "$app/navigation";

  interface SignupErrors {
    email: Array<string>,
    password: Array<string>,
    passwordConfirm: Array<string>,
    responseError: string
  }

  const signUpFormSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty({message: "Password must have at least 1 character"}),
    passwordConfirm: z.string().nonempty({message: "Password must have at least 1 character"})
  }).superRefine(({password, passwordConfirm}, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["passwordConfirm", "password"]
      })
    }
  });

  const errors: SignupErrors = {
    email: [],
    password: [],
    passwordConfirm: [],
    responseError: ""
  }

  const signUpData = {
    email: "",
    password: "",
    passwordConfirm: ""
  }

  let emailInputBlurred = false;
  let passwordInputBlurred = false;
  let passwordConfirmInputBlurred = false;
  let buttonDisabled = true;

  $: {
    const parsed = signUpFormSchema.safeParse(signUpData)
    let parsedErrors: Array<FormError> = [];

    if (!parsed.success) {
      parsedErrors = parsed.error.errors.map((error) => {
        return {
          field: error.path[0],
          message: error.message,
        };
      });
    }

    errors.email = parsedErrors.filter((formErr) => formErr.field === "email").map((err) => err.message);
    errors.password = parsedErrors.filter((formErr) => formErr.field === "password").map((err) => err.message);
    errors.passwordConfirm = parsedErrors.filter((formErr) => formErr.field === "passwordConfirm").map((err) => err.message);

    buttonDisabled = errors.email.length > 0 || errors.password.length > 0 || errors.passwordConfirm.length > 0;
  }

	function signUpRequest(): void {
    sendPostRequest(`${AUTH_ROUTE}/signup`, {
      email: signUpData.email,
      password: signUpData.password
    }).then(async res => {
        if (!res.ok) {
          throw new Error((await res.json()).message);
        }
        return res.json();
      }).then(() => {
        errors.responseError = "";
        goto("/login")
      })
      .catch((err) => {
        if (!errors.responseError.includes(err.message)) {
          errors.responseError = err.message
        }
        console.error(err);
      })}

</script>
<div class="flex justify-center py-4">
  <div class="p-10 bg-gray-700 flex justify-center items-center">
    <div class="bg-gray-300 flex justify-center items-center">
      <form class="p-2 w-[400px] h-[300px]">
          <FormInput 
            label="Email"
            id="email"
            bind:value={signUpData.email}
            bind:blurred={emailInputBlurred}
            inputErrors={errors.email} />
          <FormInput 
            label="Password"
            id="password"
            type="password"
            bind:value={signUpData.password}
            bind:blurred={passwordInputBlurred}
            inputErrors={errors.password} />
          <FormInput 
            label="Confirm password"
            id="password-confirm"
            type="password"
            bind:value={signUpData.passwordConfirm}
            bind:blurred={passwordConfirmInputBlurred}
            inputErrors={errors.passwordConfirm} />
          <SubmitButton disabled={buttonDisabled} action={signUpRequest} text="Sign Up" />
        {#if errors.responseError.length > 0}
          <div class="mt-1 text-red-600 font-bold">
            {errors.responseError}
          </div>
        {/if}
      </form>
    </div>
  </div>
</div>
