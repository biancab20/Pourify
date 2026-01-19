import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FormInput from "@/components/dynamicComponents/FormInput";

// Silence Icon (native-ish)
jest.mock("@/components/icons/Icon", () => ({
  Icon: () => null,
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-blur", () => ({
  BlurView: ({ children }: any) => children,
}));

// Ensure theme has everything FormInput uses
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

/**
 * Harness that updates `value` prop when onChange fires
 * (needed because blur logic reads `value` prop)
 */

type HarnessProps = Omit<
  React.ComponentProps<typeof FormInput>,
  "value" | "onChange"
> & {
  value: string;
  onChangeSpy: jest.Mock;
};
function Harness({ onChangeSpy, value, ...rest }: HarnessProps) {
  const [val, setVal] = React.useState(value);

  return (
    <FormInput
      {...rest}
      value={val}
      onChange={(v) => {
        onChangeSpy(v);
        setVal(String(v));
      }}
    />
  );
}

describe("FormInput", () => {
  test("text mode: calls onChange with typed string", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Name"
        type="text"
      />,
    );

    fireEvent.changeText(getByPlaceholderText("Name"), "Hello");
    expect(onChangeSpy).toHaveBeenCalledWith("Hello");
  });

  test("email mode: uses email keyboard and does not autocapitalize", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Email"
        type="email"
      />,
    );

    const input = getByPlaceholderText("Email");
    expect(input.props.keyboardType).toBe("email-address");
    expect(input.props.inputMode).toBe("email");
    expect(input.props.autoCapitalize).toBe("none");

    fireEvent.changeText(input, "a@b.com");
    expect(onChangeSpy).toHaveBeenCalledWith("a@b.com");
  });

  test("number integer mode: sets numeric keyboard + calls onChange with string while typing", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Number"
        type="number"
      />,
    );

    const input = getByPlaceholderText("Number");
    expect(input.props.keyboardType).toBe("number-pad");
    expect(input.props.inputMode).toBe("numeric");

    fireEvent.changeText(input, "12");
    expect(onChangeSpy).toHaveBeenCalledWith("12"); // ✅ string while typing
  });

  test("number integer mode: rejects invalid characters", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Number"
        type="number"
      />,
    );

    const input = getByPlaceholderText("Number");

    fireEvent.changeText(input, "12a"); // invalid for integer regex
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  test("number decimal mode: respects maxDecimalDigits", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Amount"
        type="number"
        decimal
        maxDecimalDigits={2}
      />,
    );

    const input = getByPlaceholderText("Amount");
    expect(input.props.keyboardType).toBe("decimal-pad");
    expect(input.props.inputMode).toBe("decimal");

    fireEvent.changeText(input, "1.23");
    expect(onChangeSpy).toHaveBeenCalledWith("1.23"); // ✅ string while typing

    onChangeSpy.mockClear();

    fireEvent.changeText(input, "1.234"); // 3 decimals not allowed
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  test("number mode: empty string calls onChange('')", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value="5"
        placeholder="Number"
        type="number"
      />,
    );

    fireEvent.changeText(getByPlaceholderText("Number"), "");
    expect(onChangeSpy).toHaveBeenCalledWith("");
  });

  test("number mode: min clamps on blur (not on changeText)", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Number"
        type="number"
        min={10}
      />,
    );

    const input = getByPlaceholderText("Number");
    fireEvent.changeText(input, "5");
    // typing gives "5"
    expect(onChangeSpy).toHaveBeenCalledWith("5");

    onChangeSpy.mockClear();

    fireEvent(input, "blur");
    // blur clamps to min and emits string
    expect(onChangeSpy).toHaveBeenCalledWith("10");
  });

  test("number mode: max clamps on blur (not on changeText)", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value=""
        placeholder="Number"
        type="number"
        max={7}
      />,
    );

    const input = getByPlaceholderText("Number");
    fireEvent.changeText(input, "12");
    expect(onChangeSpy).toHaveBeenCalledWith("12");

    onChangeSpy.mockClear();

    fireEvent(input, "blur");
    expect(onChangeSpy).toHaveBeenCalledWith("7");
  });

  test("shows clear button when value is non-empty and clears on press", () => {
    const onChangeSpy = jest.fn();
    const { getByLabelText } = render(
      <Harness onChangeSpy={onChangeSpy} value="hello" type="text" />,
    );

    fireEvent.press(getByLabelText("Clear input"));
    expect(onChangeSpy).toHaveBeenCalledWith("");
  });

  test("does not show clear button when disabled", () => {
    const onChangeSpy = jest.fn();
    const { queryByLabelText, getByLabelText } = render(
      <Harness onChangeSpy={onChangeSpy} value="hello" disabled />,
    );

    expect(getByLabelText("Input field")).toBeTruthy();
    expect(queryByLabelText("Clear input")).toBeNull();
  });

  test("disabled sets TextInput editable=false", () => {
    const onChangeSpy = jest.fn();
    const { getByPlaceholderText } = render(
      <Harness
        onChangeSpy={onChangeSpy}
        value="x"
        placeholder="Any"
        disabled
      />,
    );

    expect(getByPlaceholderText("Any").props.editable).toBe(false);
  });
});
