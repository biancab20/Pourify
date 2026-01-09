import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import FormInput from "@/components/ui/FormInput";

// Silence Icon (native-ish)
jest.mock("@/components/icons/Icon", () => ({
  Icon: () => null,
}));

// Ensure theme has everything FormInput uses (including isDark + palette)
jest.mock("@/stores/app-theme-context", () => ({
  useAppTheme: () => ({
    theme: {
      isDark: false,
      colors: {
        text: "#111",
        background: "#fff",
        cardBackground: "#eee",
        icon: "#222",
      },
      palette: {
        black: "#000",
        white: "#fff",
        yellow: "#ff0",
      },
    },
  }),
}));

describe("FormInput", () => {
  test("text mode: calls onChange with typed string", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <FormInput value="" onChange={onChange} placeholder="Name" type="text" />
    );

    fireEvent.changeText(getByPlaceholderText("Name"), "Hello");

    expect(onChange).toHaveBeenCalledWith("Hello");
  });

  test("email mode: uses email keyboard and does not autocapitalize", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <FormInput
        value=""
        onChange={onChange}
        placeholder="Email"
        type="email"
      />
    );

    const input = getByPlaceholderText("Email");
    expect(input.props.keyboardType).toBe("email-address");
    expect(input.props.inputMode).toBe("email");
    expect(input.props.autoCapitalize).toBe("none");

    fireEvent.changeText(input, "a@b.com");
    expect(onChange).toHaveBeenCalledWith("a@b.com");
  });

  test("number integer mode: parses int and calls onChange with number", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="" onChange={onChange} type="number" />
    );

    const input = getByLabelText("Number input");
    expect(input.props.keyboardType).toBe("number-pad");
    expect(input.props.inputMode).toBe("numeric");

    fireEvent.changeText(input, "12");
    expect(onChange).toHaveBeenCalledWith(12);
  });

  test("number integer mode: rejects invalid characters", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="" onChange={onChange} type="number" />
    );

    const input = getByLabelText("Number input");

    fireEvent.changeText(input, "12a"); // invalid for integer regex
    expect(onChange).not.toHaveBeenCalled();
  });

  test("number decimal mode: parses float and respects maxDecimalDigits", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput
        value=""
        onChange={onChange}
        type="number"
        decimal
        maxDecimalDigits={2}
      />
    );

    const input = getByLabelText("Number input");
    expect(input.props.keyboardType).toBe("decimal-pad");
    expect(input.props.inputMode).toBe("decimal");

    fireEvent.changeText(input, "1.23");
    expect(onChange).toHaveBeenCalledWith(1.23);

    onChange.mockClear();

    // 3 decimals not allowed -> should not call
    fireEvent.changeText(input, "1.234");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("number mode: empty string calls onChange('')", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="5" onChange={onChange} type="number" />
    );

    fireEvent.changeText(getByLabelText("Number input"), "");
    expect(onChange).toHaveBeenCalledWith("");
  });

  test("number mode: min clamps value", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="" onChange={onChange} type="number" min={10} />
    );

    fireEvent.changeText(getByLabelText("Number input"), "5");
    expect(onChange).toHaveBeenCalledWith(10);
  });

  test("number mode: max clamps value", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="" onChange={onChange} type="number" max={7} />
    );

    fireEvent.changeText(getByLabelText("Number input"), "12");
    expect(onChange).toHaveBeenCalledWith(7);
  });

  test("shows clear button when value is non-empty and clears on press", () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(
      <FormInput value="hello" onChange={onChange} type="text" />
    );

    fireEvent.press(getByLabelText("Clear input"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  test("does not show clear button when disabled", () => {
    const onChange = jest.fn();
    const { queryByLabelText, getByLabelText } = render(
      <FormInput value="hello" onChange={onChange} disabled />
    );

    // container exists
    expect(getByLabelText("Input field")).toBeTruthy();

    // but clear button hidden
    expect(queryByLabelText("Clear input")).toBeNull();
  });

  test("disabled sets TextInput editable=false", () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <FormInput
        value="x"
        onChange={onChange}
        placeholder="Any"
        disabled
      />
    );

    expect(getByPlaceholderText("Any").props.editable).toBe(false);
  });
});
