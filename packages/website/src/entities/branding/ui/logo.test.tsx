import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Logo from "./logo";

test("clicking on the logo redirects to the home page", async () => {
  render(
    <MemoryRouter>
      <Logo />
    </MemoryRouter>,
  );

  const logo = screen.getByTestId("logo");
  userEvent.click(logo);

  expect(window.location.pathname).toBe("/");
});
