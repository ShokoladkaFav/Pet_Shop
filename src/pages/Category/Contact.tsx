import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const location = useLocation();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // State для полів форми
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    setServiceType(type);
  }, [location]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 📡 СИМУЛЯЦІЯ ВІДПРАВКИ В БД (LocalStorage)
    // Це дозволяє Ветеринару побачити заявку у WorkerDashboard
    const newRequest = {
      id: Date.now(), // унікальний ID
      clientName: clientName,
      email: email,
      type: serviceType || "general",
      desc: desc,
      date: new Date().toISOString().split('T')[0],
      status: "New"
    };

    const existingRequests = JSON.parse(localStorage.getItem("vet_requests_db") || "[]");
    existingRequests.push(newRequest);
    localStorage.setItem("vet_requests_db", JSON.stringify(existingRequests));

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/"); 
  };

  return (
    <div className="contact">
      <h1>Онлайн-звернення до ветеринара 🩺</h1>
      <p>
        Ви можете швидко отримати консультацію або допомогу — заповніть форму
        нижче.
      </p>

      {/* 🔹 Онлайн-консультація */}
      {serviceType === "consultation" && (
        <div className="form-box">
          <h2>Онлайн-консультація</h2>
          <p className="info-text">
            Оберіть зручний формат консультації та введіть ваші дані.
          </p>

          <form className="vet-form" onSubmit={handleSubmit}>
            <label>Ім’я</label>
            <input 
              type="text" placeholder="Ваше ім’я" required 
              value={clientName} onChange={e => setClientName(e.target.value)}
            />

            <label>Email</label>
            <input 
              type="email" placeholder="example@email.com" required 
              value={email} onChange={e => setEmail(e.target.value)}
            />

            <label>Формат консультації</label>
            <select required>
              <option value="">Оберіть формат</option>
              <option value="video">Відео-дзвінок</option>
              <option value="chat">Чат</option>
            </select>

            <label>Опишіть проблему</label>
            <textarea
              placeholder="Коротко опишіть, що турбує вашого улюбленця..."
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />

            <button type="submit" className="btn">
              Відправити запит
            </button>
          </form>
        </div>
      )}

      {/* 🔹 Діагностика симптомів */}
      {serviceType === "diagnosis" && (
        <div className="form-box">
          <h2>Діагностика симптомів 🐾</h2>
          <p className="info-text">
            Завантажте фото вашої тваринки та коротко опишіть симптоми.
            Послуга <strong>безкоштовна</strong>.
          </p>

          <form className="vet-form" onSubmit={handleSubmit}>
            <label>Ім’я</label>
            <input 
              type="text" placeholder="Ваше ім’я" required 
              value={clientName} onChange={e => setClientName(e.target.value)}
            />

            <label>Email</label>
            <input 
              type="email" placeholder="example@email.com" required 
              value={email} onChange={e => setEmail(e.target.value)}
            />

            <label>Фото тваринки</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {preview && (
              <div className="preview-box">
                <img src={preview} alt="Прев’ю тваринки" />
              </div>
            )}

            <label>Опис симптомів</label>
            <textarea
              placeholder="Опишіть, що турбує вашу тваринку..."
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />

            <button type="submit" className="btn">
              Надіслати
            </button>
          </form>
        </div>
      )}

      {/* 🔹 Консультація по харчуванню */}
      {serviceType === "nutrition" && (
        <div className="form-box">
          <h2>Консультація по харчуванню 🥦</h2>
          <p className="info-text">
            Поради щодо правильного раціону для вашого улюбленця.
          </p>

          <form className="vet-form" onSubmit={handleSubmit}>
            <label>Ім’я</label>
            <input 
              type="text" placeholder="Ваше ім’я" required 
              value={clientName} onChange={e => setClientName(e.target.value)}
            />

            <label>Email</label>
            <input 
              type="email" placeholder="example@email.com" required 
              value={email} onChange={e => setEmail(e.target.value)}
            />

            <label>Тип тваринки</label>
            <select required>
              <option value="">Оберіть тип</option>
              <option value="dog">Собака</option>
              <option value="cat">Кіт</option>
              <option value="bird">Пташка</option>
              <option value="fish">Рибка</option>
              <option value="other">Інше</option>
            </select>

            <label>Опишіть раціон тваринки</label>
            <textarea
              placeholder="Вкажіть, чим зараз харчується ваш улюбленець..."
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />

            <button type="submit" className="btn">
              Надіслати запит
            </button>
          </form>
        </div>
      )}

      {/* 🟢 Модальне вікно підтвердження */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>✅ Запит відправлено!</h2>
            <p>
              Ваш запит успішно збережено в базу даних клініки. Ветеринар вже отримав сповіщення.
            </p>
            <button onClick={handleCloseModal} className="btn">
              Закрити
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;