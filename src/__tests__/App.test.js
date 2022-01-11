import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../components/App";
import { renderWithRouter } from "../test-utils";

test("displays a list of films and allows a user to click a film to view the details", async () => {
  // Wrap the App component
  renderWithRouter(<App />);

  // see a list of films
  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });

  // click a film
  userEvent.click(aNewHope);

  // see that film's opening crawl text
  const crawl = await screen.findByText(/it is a period of civil war/i);
  expect(crawl).toBeInTheDocument();
});
