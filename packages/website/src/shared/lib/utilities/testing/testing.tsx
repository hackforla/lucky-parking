import { render as renderRTL } from "@testing-library/react";
import { PropsWithChildren, ReactElement } from "react";
import TestWrapper from "./test-wrapper";

const createWrapper =
  (props = {}) =>
  ({ children }: PropsWithChildren) => <TestWrapper {...props}>{children}</TestWrapper>;

export const render = (ui: ReactElement, { routes = ["/"], ...options } = {}) =>
  renderRTL(ui, { wrapper: createWrapper({ routes }), ...options });

export * from "@testing-library/react";
