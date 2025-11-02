import "./Help.css";

const helpOptions = [
  {
    name: "Підтримка клієнтів",
    desc: "Маєш питання про замовлення, оплату чи доставку? Ми завжди поруч!",
    contact: "Онлайн-чат",
    image: "/images/help-support.jpg",
  },
  {
    name: "Допомога тваринам",
    desc: "Дізнайся, як ми допомагаємо безпритульним тваринам і як ти можеш долучитись 🐾",
    contact: "Детальніше",
    image: "/images/help-animals.jpg",
  },
  {
    name: "Технічна підтримка",
    desc: "Проблеми з сайтом або особистим кабінетом? Ми допоможемо розібратися!",
    contact: "Зв’язатися",
    image: "/images/help-technical.jpg",
  },
];

function Help() {
  return (
    <div className="help">
      <h1>Онлайн-допомога 🤝</h1>
      <p>
        Ми завжди поруч, щоб допомогти — чи то питання про замовлення, чи турбота
        про тварин ❤️
      </p>

      <div className="help-grid">
        {helpOptions.map((item, index) => (
          <div key={index} className="help-card">
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="desc">{item.desc}</p>
            <a href="/contact" className="btn">
              {item.contact}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Help;
