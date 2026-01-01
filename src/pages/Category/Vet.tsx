
import { useNavigate } from "react-router-dom";
import "./Vet.css";

const vetServices = [
  {
    name: "Онлайн-консультація",
    desc: "Швидка допомога від кваліфікованого ветеринара через відеозв’язок або чат у реальному часі.",
    price: "300 грн / 30 хв",
    image: "/images/vet-online.jpg",
    type: "consultation",
  },
  {
    name: "Консультація по харчуванню",
    desc: "Індивідуальний підбір раціону, аналіз поточного харчування та поради щодо вітамінів.",
    price: "250 грн / сеанс",
    image: "/images/vet-nutrition.jpg",
    type: "nutrition",
  },
  {
    name: "Діагностика симптомів",
    desc: "Попередня оцінка стану тварини на основі ваших фото, відео та детального опису симптомів.",
    price: "Безкоштовно",
    image: "/images/vet-diagnosis.jpg",
    type: "diagnosis",
  },
];

function Vet() {
  const navigate = useNavigate();

  const handleNavigate = (type: string) => {
    navigate(`/contact?type=${type}`);
  };

  return (
    <div className="vet">
      <div className="vet-header-section">
        <h1>Онлайн-ветеринар 🩺</h1>
        <p>
          Професійна турбота про здоров'я ваших улюбленців не виходячи з дому. 
          Швидко, зручно та з любов'ю до кожної тваринки.
        </p>
      </div>

      <div className="vet-grid">
        {vetServices.map((service, index) => (
          <div key={index} className="vet-card" onClick={() => handleNavigate(service.type)}>
            <div className="vet-image-container">
              <img src={service.image} alt={service.name} onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Vet+Service" }} />
            </div>
            <div className="vet-card-content">
              <h3>{service.name}</h3>
              <p className="desc">{service.desc}</p>
              <div className="vet-price-tag">
                <span className="price-label">Вартість:</span>
                <span className={`price-value ${service.price === 'Безкоштовно' ? 'free' : ''}`}>{service.price}</span>
              </div>
              <button
                className="vet-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(service.type);
                }}
              >
                Обрати послугу
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="vet-footer-info">
        <p>Зверніть увагу: онлайн-консультація не замінює очний візит у разі критичних станів.</p>
      </div>
    </div>
  );
}

export default Vet;
