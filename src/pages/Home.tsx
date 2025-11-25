import "./Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Ласкаво просимо до ZooMarket 🐾</h1>
      <p>У нас ви знайдете все для своїх улюбленців!</p>

      {/* 🔹 Кнопка для тесту сторінки 404 */}
      <button
        className="cta-button"
        onClick={() => navigate("/якогось-нема")}
      >
        Перевірити сторінку 404
      </button>
    </div>
  );
};

export default Home;
