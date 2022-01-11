import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Crawl from "react-star-wars-crawl";
import { integerToRoman } from "../utils";

function Film() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);

  useEffect(() => {
    setFilm(null);
    fetch(`https://swapi.dev/api/films/${id}`)
      .then((r) => r.json())
      .then((film) => setFilm(film));
  }, [id]);

  if (!film) return <h1>Loading...</h1>;

  return (
    <Crawl
      title={`Episode ${integerToRoman(film.episode_id)}`}
      subTitle={film.title}
      text={film.opening_crawl}
    />
  );
}

export default Film;
