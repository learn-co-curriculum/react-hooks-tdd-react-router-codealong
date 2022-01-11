# Testing React Router Codealong

## Learning Goals

- Identify the challenges of testing components that use React Context
- Test user navigation using client-side routing with React Router

## Introduction

One common feature of many React applications is _client-side routing_: the
ability to change what is displayed on the page based on the URL, without
needing to load a new HTML document. React Router is a popular library for
client-side routing in React. It gives us several components and hooks that let
us conditionally render components based on the current URL, and change the URL
when a user clicks a link.

In this lesson, we'll see how to test components that use React Router, as well
as some techniques to simplify some of the boilerplate code needed to work with
React Router in our tests.

## Testing Context

One challenge introduced by React Router is that it adds an additional _source
of truth_ for our application: instead of just relying on changes to our
component state to change what the user sees on the page, our application must
also respond to changes in the browser URL. Take this minimal React Router code
as an example:

```jsx
function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Switch>
        <Route path="/about">
          <h1>About Page</h1>
        </Route>
        <Route path="/">
          <h1>Home Page</h1>
        </Route>
      </Switch>
    </div>
  );
}

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
```

In the example above, when a user clicks on the "about" link, the "About Page"
text will be displayed. Notice all this happens without us adding or updating
any component state. Under the hood, React Router handles these state changes
internally and re-renders our components when the URL changes.

How does this work? React Router uses the [React Context][context] system to
manage its internal state and subscribe child components to changes in that
state based on changes to the URL. The `<BrowserRouter>` component above is a
**context provider**, and all of React Router's custom components (like
`<Switch>` and `<Route>`) rely on the `<BrowserRouter>` component to provide
them with the necessary data to perform their client-side routing
responsibilities.

What this means for us is that when we're writing tests that involve React
Router components, we'll also have to provide a similar setup in our tests, and
wrap components in a `<BrowserRouter>` component. We can no longer test these
components in total isolation: they now have a **dependency** on React Router
that we must include in the tests.

Let's see this in action by writing out some tests for an example application.

## Code Along

To demonstrate how to incorporate React Router into our testing process, we'll
be working on adding tests to an existing application. The application uses the
Star Wars API ([SWAPI][swapi]) to retrieve data about Star Wars films.

To code along, fork and clone this lesson. Run `npm install && npm start` to
explore the app in the browser.

In this application, a user can:

- See a list of Star Wars films (the first six, since that's all the API has)
- Click a film and see the "opening crawl" (the intro text that plays at the
  start of each Star Wars movie)

It uses React Router to establish the following routes:

- `/`: Show the "Home" component with info about the site
- `/films/:id`: Show the "Films" component with info about a specific film

With those features in mind, let's start writing some tests to help understand
how React Router works in our application, and what setup is necessary to test
components that use React Router.

## Testing Outside In

For our first test, let's find a way to test the core functionality of our
application at a high level. Generally, a user should be able to see a list of
Star Wars films, click a film, and see the opening crawl text. Let's use that
description to start writing our test of the `<App>` component.

Add this code to the `src/__tests__/App.test.js` file:

```jsx
test("displays a list of films and allows a user to click a film to view the details", async () => {
  render(<App />);

  // see a list of films
  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });

  // click a film
  userEvent.click(aNewHope);

  // see that film's opening crawl text
  const crawl = await screen.findByText(/it is a period of civil war/i);
  expect(crawl).toBeInTheDocument();
});
```

To explain what's happening this test: the "list of films" in our application is
displayed by the `<Sidebar>` component, which makes a request to the API and
uses that data to populate a `<Link>` components with each film's title.
Clicking a film then changes the browser's URL to `/films/:id` (with `:id` being
the actual ID number of the film).

The routes are established in the `<App>` component:

```jsx
// src/components/App.js

function App() {
  return (
    <div className="App">
      <Sidebar />
      <main>
        <Switch>
          <Route path="/films/:id">
            <Film />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </main>
    </div>
  );
}
```

So when a user clicks one of these film links, our routes will render the
`<Film>` component, which uses the ID from the URL using the `useParams` hook to
determine which film the user is viewing:

```jsx
// src/components/Film.js

function Film() {
  // Access the ID from the URL
  // We can do this because this component is being rendered by the <Route path="/films/:id">
  const { id } = useParams();
  const [film, setFilm] = useState(null);

  useEffect(() => {
    setFilm(null);
    fetch(`https://swapi.dev/api/films/${id}`)
      .then((r) => r.json())
      .then((film) => setFilm(film));
  }, [id]);

  // ...rest of component
}
```

Let's see how our tests are doing! Run them now with `npm test`, and you'll see
that our `App.test.js` test is failing with the following error message:

```txt
Error: Invariant failed: You should not use <Switch> outside a <Router>
```

What does this mean? Well, if you'll recall, any time we need to use React
Router, we need to wrap any components that use React Router in a special
`<Router>` component. This is the **context provider** that makes much of React
Router's functionality possible. In our application, we're wrapping the entire
component tree in a `<BrowserRouter>` component:

```jsx
// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "react-star-wars-crawl/lib/index.css";
import App from "./components/App";

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);
```

Our tests require a similar setup: we also need to wrap our `<App>` component
with a `<Router>` when we render the component in our test environment. Update
the test like so:

```jsx
import { BrowserRouter } from "react-router-dom"; // add BrowserRouter to your imports

test("displays a list of films and allows a user to click a film to view the details", async () => {
  // Wrap the App component
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // find the first film
  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });

  // click it
  userEvent.click(aNewHope);

  // see the film crawl text
  const crawl = await screen.findByText(/it is a period of civil war/i);
  expect(crawl).toBeInTheDocument();
});
```

With that change, our components can access React Router's context, and our test
is passing!

This is an important rule to follow: **any time we're testing a component that
uses context, we need to wrap that component in a context provider during
testing**.

React's context system is a way of allowing components to access external state
without that state being passed as a prop. It's like a hidden dependency of our
components, and we must treat it with care.

In our case, that means any component that uses a React Router component (like
`<Link>` or `<Route>`) or a hook (like `useParams`) must be wrapped in a
`<Router>` component when testing.

Let's see some more examples of when wrapping a component is necessary during
testing.

## Testing Components With Links

We've tested our application at a high level, but it'd also be beneficial to
test some of our components individually to expand our test coverage. Let's test
the `<Sidebar>` component in isolation next. We can test that this component on
its own is able to display a list of Star Wars films. Add the following test
code:

```jsx
// src/__tests__/Sidebar.test.js

test("displays a list of Star Wars films", async () => {
  render(<Sidebar />);

  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });
  const empireStrikesBack = await screen.findByRole("link", {
    name: /the empire strikes back/i,
  });

  expect(aNewHope).toBeInTheDocument();
  expect(empireStrikesBack).toBeInTheDocument();
});
```

Run the tests again. Just like before, we'll get an error message from React
Router:

```txt
Error: Invariant failed: You should not use <Link> outside a <Router>
```

We can solve it the same way: by wrapping our `<Sidebar>` component with a
`<BrowserRouter>`:

```jsx
// src/__tests__/Sidebar.test.js

import { BrowserRouter } from "react-router-dom";

test("displays a list of Star Wars films", async () => {
  render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );

  const aNewHope = await screen.findByRole("link", { name: /a new hope/i });
  const empireStrikesBack = await screen.findByRole("link", {
    name: /the empire strikes back/i,
  });

  expect(aNewHope).toBeInTheDocument();
  expect(empireStrikesBack).toBeInTheDocument();
});
```

## Testing Components With Params

Our final test will be a bit trickier. Let's find out a way to test if our
`<Film>` component displays the correct film based on the URL. Recall that we're
using a `<Route>` component to display the `<Film>` component when the URL
matches `/films/:id`, and using the `useParams` hook to access the current ID
from the URL.

Any time we need to test a component that uses the `useParams` hook, we'll need
to set it up the test environment for our component with all the information it
needs:

- A `<Route>` component with a `path` prop
- A URL that matches the `path`

Here's how we're using that information in the `<Film>` component:

```jsx
// src/components/Film.js

function Film() {
  // Access the ID from the URL
  // We can do this because this component is being rendered by the <Route path="/films/:id">
  const { id } = useParams();
  const [film, setFilm] = useState(null);

  useEffect(() => {
    setFilm(null);
    fetch(`https://swapi.dev/api/films/${id}`)
      .then((r) => r.json())
      .then((film) => setFilm(film));
  }, [id]);

  // ...rest of component
}
```

So we'll need a way to set the URL in the test environment to something like
`/films/1` so we can test that the correct film information is displayed based
on that URL. To start, add the following test code:

```jsx
// src/__tests__/Film.test.js

import { BrowserRouter } from "react-router-dom";

test("displays a Star Wars film's information based on the URL", async () => {
  // navigate to /films/1
  // TODO

  // render the Film component
  render(
    <BrowserRouter>
      <Film />
    </BrowserRouter>
  );

  // expect the title and crawl text to be displayed
  const title = await screen.findByText(/a new hope/i);
  const crawl = await screen.findByText(/it is a period of civil war/i);

  expect(title).toBeInTheDocument();
  expect(crawl).toBeInTheDocument();
});
```

Run the tests now, and we'll see that our new test is failing. Our component
doesn't have enough information yet: it still needs a way to use the `useParams`
hook based on the URL and the `<Route>` setup.

We can fixing this problem by navigating to a specific URL in our test
environment using the [`history.pushState()`][push-state] method, and by setting
up a `<Route>` component to match the appropriate URL:

```jsx
// src/__tests__/Film.test.js

import { BrowserRouter, Route } from "react-router-dom";

test("displays a Star Wars film's information based on the URL", async () => {
  // navigate to /films/1
  window.history.pushState({}, "", "/films/1"); // add this line

  // render the Film component
  // add a Route component
  render(
    <BrowserRouter>
      <Route path="/films/:id">
        <Film />
      </Route>
    </BrowserRouter>
  );

  // expect the title and crawl text to be displayed
  const title = await screen.findByText(/a new hope/i);
  const crawl = await screen.findByText(/it is a period of civil war/i);

  expect(title).toBeInTheDocument();
  expect(crawl).toBeInTheDocument();
});
```

With those changes in place, our tests are all passing! We've successfully set
up the test environment for our `<Film>` component with all the information it
needs in order to use the `useParams` hook:

- A `<Route>` component with a `path` prop
- A URL that matches the `path`

## Bonus: Refactoring Reusable Test Methods

> Consider this section optional: if you're curious about how to create testing
> utilities to make it easier to test React Router components (and other
> components that use context), read on! Otherwise, this isn't essential
> learning.

Any time we're testing components that use React Router, we end up with a
similar setup. For all of those components, we need a way to wrap them with a
`<Router>` component that provides the proper context for React Router. We also
may need to change the URL before running our tests so that we can check for
components that match particular routes.

To make the process of testing these components easier, let's refactor the code
from our test files to a reusable utility function. We'll be adding this code in
the `src/test-utils/index.js` file.

Ideally, we'd like a way to replace this code our test files:

```jsx
test("a component that uses React Router", () => {
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
  );
});
```

With something like this:

```jsx
test("a component that uses React Router", () => {
  renderWithRouter(<Component />);
});
```

React Router provides a [`wrapper`][wrapper] option for its `render` method that
helps write code for just this scenario. Let's give it a shot! Add the following
code in the `test-utils`:

```jsx
// src/test-utils/index.js

import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

export function renderWithRouter(component) {
  return render(component, { wrapper: BrowserRouter });
}
```

> This code is basically the equivalent of:
>
> ```jsx
> render(<BrowserRouter>{component}</BrowserRouter>);
> ```

Then, use it in the tests for the `<App>` component:

```jsx
// src/__tests__/App.test.js

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../components/App";
import { renderWithRouter } from "../test-utils";

test("displays a list of films and allows a user to click a film to view the details", async () => {
  // Wrap the App component
  renderWithRouter(<App />);

  // ...rest of test
});
```

Our test still works, but there's less boilerplate code in our test file, so we
can focus more on what's unique to this test.

We can also make our test utility more flexible by providing the ability to pass
other options, like a default route, so that we can navigate to a specific URL
before rendering the component:

```jsx
// src/test-utils/index.js

import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

export function renderWithRouter(component, { route = "/" } = {}) {
  window.history.pushState({}, "", route);
  return render(component, { wrapper: BrowserRouter });
}
```

This lets us update our tests for the `<Film>` component, and navigate to
`/films/1` for our test:

```jsx
// src/__tests__/Film.test.js

import { screen } from "@testing-library/react";
import { Route } from "react-router-dom";
import Film from "../components/Film";
import { renderWithRouter } from "../test-utils";

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
  // ...rest of test
});
```

As a last step, we can make our `renderWithRouter` function more flexible by
passing along additional options, since the [`render`][render] method from React
Testing Library allows a few other options we may need in specific scenarios.
Here's the final form of our utility function:

```jsx
// src/test-utils/index.js

export function renderWithRouter(component, { route = "/", ...options } = {}) {
  window.history.pushState({}, "", route);

  return render(component, {
    wrapper: BrowserRouter,
    ...options,
  });
}
```

And there you have it! A nice, reusable test utility for React Router that you
can use in any project.

## Conclusion

Testing components that use React Router require additional setup, because those
components have an additional _dependency_ on React Router through React's
[context][] system. Any time we're testing a component that uses context, we
need to wrap that component in a context provider during testing. For React
Router specifically, that means wrapping components in a `<Router>` component
when rendering them in the test environment.

## Resources

- [React Testing Library - Router Example](https://testing-library.com/docs/example-react-router/)

[context]: https://reactjs.org/docs/context.html
[swapi]: https://swapi.dev/documentation
[push-state]: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
[wrapper]:
  https://testing-library.com/docs/react-testing-library/setup#custom-render
[render]: https://testing-library.com/docs/react-testing-library/api#render

```

```
