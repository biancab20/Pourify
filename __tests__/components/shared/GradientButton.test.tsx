/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Button from "@/components/shared/GradientButton";

const getPushMock = () => {
  const router = require("expo-router").useRouter();
  return router.push as jest.Mock;
};

describe("Button", () => {
  beforeEach(() => {
    getPushMock().mockClear();
  });

  test("renders the provided text", () => {
    const { getByText } = render(<Button text="Click me" />);
    expect(getByText("Click me")).toBeTruthy();
  });

  test("navigates when destination is provided", () => {
    const push = getPushMock();

    const { getByRole } = render(
      <Button destination="/all-products-view" text="Go" />
    );

    fireEvent.press(getByRole("button"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/all-products-view",
      params: {},
    });
  });

  test("passes params when navigating", () => {
    const push = getPushMock();

    const { getByRole } = render(
      <Button
        destination="/bar-view"
        params={{ barId: "b1" }}
        text="Open"
      />
    );

    fireEvent.press(getByRole("button"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/bar-view",
      params: { barId: "b1" },
    });
  });

  test("calls onPress instead of navigating when onPress is provided", () => {
    const push = getPushMock();
    const onPress = jest.fn();

    const { getByRole } = render(
      <Button destination="/should-not-go" text="Tap" onPress={onPress} />
    );

    fireEvent.press(getByRole("button"));

    expect(onPress).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  test("does nothing when disabled", () => {
    const push = getPushMock();
    const onPress = jest.fn();

    const { getByRole } = render(
      <Button
        destination="/nope"
        text="Disabled"
        disabled
        onPress={onPress}
      />
    );

    fireEvent.press(getByRole("button"));

    expect(onPress).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  test("secondary variant still renders text", () => {
    const { getByText } = render(<Button text="Secondary" variant="secondary" />);
    expect(getByText("Secondary")).toBeTruthy();
  });
});
