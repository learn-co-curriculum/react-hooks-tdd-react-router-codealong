import { screen } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { renderWithRouter } from "../test-utils";

// Your code here
test("displays a list of Star Wars films", async () => {
  renderWithRouter(<Sidebar />);

  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });
  const empireStrikesBack = await screen.findByRole("link", {
    name: /the empire strikes back/i,
  });

  expect(aNewHope).toBeInTheDocument();
  expect(empireStrikesBack).toBeInTheDocument();
});
