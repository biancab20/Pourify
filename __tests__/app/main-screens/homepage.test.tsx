/* eslint-disable import/first */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import * as ReactNative from "react-native";
import { useRouter } from "expo-router";

const mockUseBars = jest.fn();
jest.mock("@/hooks/useLocations", () => ({
  __esModule: true,
  useBars: (...args: any[]) => mockUseBars(...args),
}));

jest.mock("@/components/icons/Icon", () => ({ Icon: () => null }));
jest.mock("@/components/staticComponents/PieChartStatic", () => () => null);
jest.mock("@/components/staticComponents/WideCardStatic", () => {
  const Comp = ({ children }: any) => children;
  (Comp as any).displayName = "WideCardStaticMock";
  return Comp;
});

import HomeScreen from "../../../app/(main-screens)/homepage";

beforeEach(() => {
  mockUseBars.mockReset();

  jest
    .spyOn(ReactNative, "useWindowDimensions")
    .mockReturnValue({ width: 400, height: 800, scale: 2, fontScale: 2 });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("HomeScreen", () => {
  test("shows loading state for bars", () => {
    mockUseBars.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Loading bars...")).toBeTruthy();
  });

  test("shows error state for bars", () => {
    mockUseBars.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("fail"),
    });
    const { getByText } = render(<HomeScreen />);
    expect(getByText("Error loading bars")).toBeTruthy();
  });

  test("shows empty state when no bars found", () => {
    mockUseBars.mockReturnValue({ data: { value: [] }, isLoading: false, error: null });
    const { getByText } = render(<HomeScreen />);
    expect(getByText("No bars found")).toBeTruthy();
  });

  test("renders bars list when bars exist", () => {
    mockUseBars.mockReturnValue({
      data: { value: [{ barId: "bar-1", name: "Main Bar" }, { barId: "bar-2", name: "Upstairs" }] },
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText("Main Bar")).toBeTruthy();
    expect(getByText("Upstairs")).toBeTruthy();
  });

  test("navigates to bar-view with params when a bar is pressed", () => {
    mockUseBars.mockReturnValue({
      data: { value: [{ barId: "bar-1", name: "Main Bar" }] },
      isLoading: false,
      error: null,
    });

    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText("Main Bar"));

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/bar-view",
      params: { barId: "bar-1", barName: "Main Bar" },
    });
  });

  test("top icons navigate to Scan and Settings", () => {
    mockUseBars.mockReturnValue({ data: { value: [] }, isLoading: false, error: null });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText("Scan new delivery"));
    fireEvent.press(getByLabelText("Settings"));

    const router = useRouter();
    expect(router.push).toHaveBeenCalledWith("/(scan-flow)/scan-new-delivery");
    expect(router.push).toHaveBeenCalledWith("/(settings)/venue-settings");
  });
});
