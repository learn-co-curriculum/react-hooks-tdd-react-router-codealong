import { rest } from "msw";
import { setupServer } from "msw/node";
import { films } from "./data";

const handlers = [
  rest.get("https://swapi.dev/api/films", (req, res, ctx) => {
    return res(ctx.json(films));
  }),
  rest.get("https://swapi.dev/api/films/:id", (req, res, ctx) => {
    const { id } = req.params;
    const filmIndex = parseInt(id) - 1;

    return res(ctx.json(films.results[filmIndex]));
  }),
];

export const server = setupServer(...handlers);
