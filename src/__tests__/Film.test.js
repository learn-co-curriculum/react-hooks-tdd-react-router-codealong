import { screen } from "@testing-library/react";
import { Route } from "react-router-dom";
import Film from "../components/Film";
import { renderWithRouter } from "../test-utils";

// Your code here
test("displays a Star Wars film's information based on the URL", async () => {
  // navigate to /films/1
  // render the Film component
  renderWithRouter(
    <Route path="/films/:id">
      <Film />
    </Route>,
    {
      route: "/films/1",
    }
  );

  // expect the title and crawl text to be displayed
  const title = await screen.findByText(/a new hope/i);
  const crawl = await screen.findByText(/it is a period of civil war/i);

  expect(title).toBeInTheDocument();
  expect(crawl).toBeInTheDocument();
});
