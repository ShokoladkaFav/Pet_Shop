import { Link } from "react-router-dom";
import "./Animals.css";

const categories = [
  { name: "Коти", icon: "🐱", link: "/category/cats" },
  { name: "Собаки", icon: "🐶", link: "/category/dogs" },
  { name: "Пташки", icon: "🐦", link: "/category/birds" },
  { name: "Рибки", icon: "🐠", link: "/category/fish" },
  { name: "Акції", icon: "🎉", link: "/category/sale" },
  { name: "Онлайн-ветеринар", icon: "🩺", link: "/category/vet" },
];

function Animals() {
  return (
    <div className="animals">
      <h1>Тварини та послуги</h1>
      <p>Обирай категорію 👇</p>
      <div className="animals-grid">
        {categories.map((cat, index) => (
          <Link key={index} to={cat.link} className="animal-card">
            <span className="animal-icon">{cat.icon}</span>
            <h3>{cat.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Animals;
