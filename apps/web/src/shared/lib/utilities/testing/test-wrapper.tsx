import { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { Store } from "@reduxjs/toolkit";

interface TestWrapperProps extends PropsWithChildren {
  routes?: string[];
  store?: Store;
}

export default function TestWrapper({ children, ...props }: TestWrapperProps) {
  const { routes = ["/"] } = props;

  return <MemoryRouter initialEntries={routes}>{children}</MemoryRouter>;
}
