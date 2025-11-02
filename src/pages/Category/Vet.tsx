import "./Vet.css";

const vetServices = [
  {
    name: "Онлайн-консультація",
    desc: "Швидка допомога від ветеринара через відеозв’язок або чат.",
    price: "300 грн / 30 хв",
    image: "/images/vet-online.jpg",
  },
  {
    name: "Консультація по харчуванню",
    desc: "Поради щодо правильного раціону для вашого улюбленця.",
    price: "250 грн",
    image: "/images/vet-nutrition.jpg",
  },
  {
    name: "Діагностика симптомів",
    desc: "Попередня оцінка стану тварини на основі ваших фото та опису.",
    price: "Безкоштовно",
    image: "/images/vet-diagnosis.jpg",
  },
];

function Vet() {
  return (
    <div className="vet">
      <h1>Онлайн-ветеринар 🩺</h1>
      <p>
        Отримайте консультацію ветеринара просто з дому — швидко, зручно та
        професійно.
      </p>

      <div className="vet-grid">
        {vetServices.map((service, index) => (
          <div key={index} className="vet-card">
            <img src={service.image} alt={service.name} />
            <h3>{service.name}</h3>
            <p className="desc">{service.desc}</p>
            <p className="price">{service.price}</p>
            <a href="/contact" className="btn">
              Записатися
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Vet;
