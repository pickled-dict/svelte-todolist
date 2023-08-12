import { describe, test, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/svelte";
import SubmitButton from "$lib/components/widgets/submitButton.svelte";

describe("submitButton tests", () => {
  test("should render the component", () => {
    const {getByText} = render(SubmitButton, {action: () => null, disabled:true })
    const button = getByText("button");

    expect(button).toBeInTheDocument();
    expect(button.hasAttribute("disabled")).toBeTruthy()
  });

  test("clicking on the enabled button should trigger the function", () => {
    const myFunc = vi.fn()
    const {getByText} = render(SubmitButton, {action: myFunc, disabled: false});

    const button = getByText("button");
    fireEvent.click(button);

    expect(myFunc).toHaveBeenCalled();
  });


  test("when disabled is set to true, the attribute 'disabled' should be set", async () => {
    const {getByText} = render(SubmitButton, {action: () => null, disabled: true});
    const button = getByText("button");

    expect(button).toHaveAttribute("disabled");
  });

  test("when text is passed into the slot, it is displayed in the button", () => {
    const buttonText = "new button text";
    const {getByText} = render(SubmitButton, {action: () => null, disabled: true, text: buttonText})

    const button = getByText(buttonText);

    expect(button).toBeInTheDocument();
  })
})
