import { Switch, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Film from "./Film";
import Home from "./Home";

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

export default App;
