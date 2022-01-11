import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    fetch("https://swapi.dev/api/films")
      .then((r) => r.json())
      .then((data) => {
        const films = data.results.map((film) => {
          const [id] = film.url.split("/").slice(-2);
          return { ...film, id };
        });
        setFilms(films);
      });
  }, []);

  return (
    <nav>
      <ul>
        {films.map((film) => (
          <li key={film.id}>
            <h2>
              <Link to={`/films/${film.id}`}>{film.title}</Link>
            </h2>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
