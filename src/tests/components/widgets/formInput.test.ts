import FormInput from "$lib/components/widgets/formInput.svelte";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

describe("FormInput Component", () => {
  test("should render the component", () => {
    render(FormInput, {bindData: "", inputErrors: []});

    const labelNode = screen.getByText(/Input/i);
    expect(labelNode);
  })

  test("when the value of bindData changes, so does the value of the input", () => {
    const inputValue = "hello world";
    const { getByRole } = render(FormInput, {value: inputValue, inputErrors: []});
    const input = getByRole("textbox");

    expect(input).toHaveValue(inputValue);
  })

  test("when no errors exist and input is blurred, display no errors", () => {
    const { queryAllByTestId } = render(FormInput, {bindData: "", blurred: true, inputErrors: []});
    const errorContainer = queryAllByTestId('input-error');

    expect(errorContainer.length).toEqual(0);
  })

  test("when errors exist and input is blurred, display errors", async () => {
    const { findAllByTestId, getByText } = render(FormInput, {bindData: "", blurred: true, inputErrors: ["error"]});
    const errorContainer = await findAllByTestId('input-error');
    const errorElement = getByText(/error/i)

    expect(errorContainer.length).toEqual(1);
    expect(errorElement).toBeTruthy();
  })

  test("when errors exist and input is not blurred, do not display errors", () => {
    const { queryAllByTestId } = render(FormInput, {bindData: "", blurred: false, inputErrors: ["error"]});
    const errorContainer = queryAllByTestId('input-error');

    expect(errorContainer.length).toEqual(0);
  })
})
