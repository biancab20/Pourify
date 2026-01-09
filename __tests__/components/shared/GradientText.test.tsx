/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { render } from "@testing-library/react-native";

import GradientText from "@/components/shared/GradientText";

jest.unmock("@/components/shared/GradientText");

// Mock MaskedView to just render children
jest.mock("@react-native-masked-view/masked-view", () => {
  const React = require("react");

  const MaskedViewMock = ({ children }: any) =>
    React.createElement(React.Fragment, null, children);

  MaskedViewMock.displayName = "MaskedViewMock";
  return MaskedViewMock;
});

// Mock LinearGradient safely (no out-of-scope refs)
jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");

  const LinearGradientMock = ({ children, ...props }: any) =>
    React.createElement(View, props, children);

  LinearGradientMock.displayName = "LinearGradientMock";
  return { LinearGradient: LinearGradientMock };
});

describe("GradientText", () => {
  test("renders children", () => {
    const { getByText } = render(
      <GradientText gradientName="paloma">Hello</GradientText>
    );

    expect(getByText("Hello")).toBeTruthy();
  });

  test("supports bananaDaiquiri gradientName", () => {
    const { getByText } = render(
      <GradientText gradientName="bananaDaiquiri">Yo</GradientText>
    );

    expect(getByText("Yo")).toBeTruthy();
  });
});
