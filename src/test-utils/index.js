import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

export function renderWithRouter(component, { route = "/", ...options } = {}) {
  window.history.pushState({}, "", route);

  return render(component, {
    wrapper: BrowserRouter,
    ...options,
  });
}
