/* eslint-disable @typescript-eslint/no-require-imports */
import React from "react";
import { Text as RNText } from "react-native";
import { render } from "@testing-library/react-native";
import { Text } from "@/components/shared/Text";
jest.unmock("@/components/shared/Text");

// Mock GradientText so we can detect it was used
jest.mock("@/components/shared/GradientText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const GradientTextMock = ({ children }: any) =>
    React.createElement(Text, null, `GRADIENT:${children}`);
  GradientTextMock.displayName = "GradientTextMock";
  return GradientTextMock;
});

describe("shared/Text", () => {
  test("renders normal text using RNText", () => {
    const { getByText, UNSAFE_queryAllByType } = render(
      <Text>Hi</Text>
    );

    expect(getByText("Hi")).toBeTruthy();

    // Should include an RNText in the tree
    expect(UNSAFE_queryAllByType(RNText).length).toBeGreaterThan(0);
  });

  test("renders GradientText when variant='gradient'", () => {
    const { getByText } = render(
      <Text variant="gradient">Hello</Text>
    );

    // Our mock prefixes content so we can assert it
    expect(getByText("GRADIENT:Hello")).toBeTruthy();
  });
});
