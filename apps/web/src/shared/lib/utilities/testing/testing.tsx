import { PropsWithChildren, ReactElement } from "react";
import { render as renderRTL, RenderResult } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import TestWrapper from "./test-wrapper";

interface CustomRenderResult extends RenderResult {
  user: UserEvent;
}

const createWrapper =
  (props = {}) =>
  ({ children }: PropsWithChildren) => <TestWrapper {...props}>{children}</TestWrapper>;

export const render = (ui: ReactElement, { routes = ["/"], ...options } = {}): CustomRenderResult => {
  const result = renderRTL(ui, { wrapper: createWrapper({ routes }), ...options });
  return {
    ...result,
    user: userEvent.setup(),
  };
};

export * from "@testing-library/react";
