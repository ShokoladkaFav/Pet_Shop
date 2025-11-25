import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-content">
        <h1>404</h1>
        <h2>Сторінку не знайдено 😿</h2>
        <p>
          Схоже, ви потрапили на сторінку, якої не існує. <br />
          Але не хвилюйтесь — поверніться на головну та знайдіть усе потрібне
          для свого улюбленця 💕
        </p>

        <Link to="/" className="btn">
          Повернутись на головну
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
