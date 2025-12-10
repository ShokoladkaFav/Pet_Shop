
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const location = useLocation();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // State для полів форми
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  
  // Специфічні поля
  const [consultationFormat, setConsultationFormat] = useState("video"); // video | chat
  const [petType, setPetType] = useState("dog"); // dog | cat | bird | fish | other

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    setServiceType(type);
  }, [location]);

  // 🔥 Стиснення зображення перед завантаженням (щоб не забивати базу)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          // Створюємо Canvas для зміни розміру
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // Максимальна ширина
          const MAX_HEIGHT = 800; // Максимальна висота
          let width = img.width;
          let height = img.height;

          // Зберігаємо пропорції
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Конвертуємо в JPEG з якістю 0.7
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPreview(dataUrl);
        };
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Пакуємо мета-дані в опис для збереження в БД
    let finalDescription = desc;

    if (serviceType === "consultation") {
        const formatText = consultationFormat === "video" ? "Відео-дзвінок" : "Чат";
        finalDescription = `[Формат: ${formatText}]\n${desc}`;
    } else if (serviceType === "nutrition") {
        const petMap: Record<string, string> = { 
            dog: "Собака", cat: "Кіт", bird: "Пташка", fish: "Рибка", other: "Інше" 
        };
        finalDescription = `[Тварина: ${petMap[petType] || petType}]\n${desc}`;
    } else if (serviceType === "diagnosis") {
        let imgTag = "";
        if (preview) {
             // Додаємо фото як Base64 стрічку в спеціальних тегах
             imgTag = `\n[ATTACHMENT]${preview}[/ATTACHMENT]`;
        }
        finalDescription = `[Тип: Діагностика по фото]${imgTag}\n${desc}`;
    }

    const payload = {
      client_name: clientName,
      email: email,
      type: serviceType || "general",
      description: finalDescription
    };

    try {
      const response = await fetch("http://localhost/zoo-api/create_vet_request.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.status === "success") {
        setShowModal(true);
      } else {
        alert("Помилка при створенні заявки: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Сервер не відповідає. Перевірте з'єднання.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/"); 
  };

  return (
    <div className="contact">
      <h1>Онлайн-звернення до ветеринара 🩺</h1>
      <p>
        Заповніть форму, і ми допоможемо вашому улюбленцю.
      </p>

      {/* 🔹 Онлайн-консультація */}
      {serviceType === "consultation" && (
        <div className="form-box">
          <h2>Онлайн-консультація</h2>
          <p className="info-text">
            Оберіть зручний формат спілкування (Відео/Чат).
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
            <select 
                required 
                value={consultationFormat} 
                onChange={(e) => setConsultationFormat(e.target.value)}
            >
              <option value="video">🎥 Відео-дзвінок</option>
              <option value="chat">💬 Текстовий чат</option>
            </select>

            <label>Опишіть проблему</label>
            <textarea
              placeholder="Коротко опишіть, що турбує вашого улюбленця..."
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Відправка..." : "Відправити запит (300 грн)"}
            </button>
          </form>
        </div>
      )}

      {/* 🔹 Діагностика симптомів (Безкоштовно) */}
      {serviceType === "diagnosis" && (
        <div className="form-box">
          <div className="badge-free">БЕЗКОШТОВНО 🔥</div>
          <h2>Діагностика симптомів 🐾</h2>
          <p className="info-text">
            Завантажте фото проблеми. Лікар огляне його.
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

            <label>Фото (макс 5MB)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {preview && (
              <div className="preview-box">
                <img src={preview} alt="Прев’ю" />
              </div>
            )}

            <label>Опис симптомів</label>
            <textarea
              placeholder="Опишіть, що сталося..."
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />
            
            <div className="warning-box">
              ⚠️ <strong>Увага!</strong> Це безкоштовна послуга. Відповідь може надійти протягом <strong>1 місяця</strong>.
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Відправка..." : "Надіслати на розгляд"}
            </button>
          </form>
        </div>
      )}

      {/* 🔹 Консультація по харчуванню */}
      {serviceType === "nutrition" && (
        <div className="form-box">
          <h2>Консультація по харчуванню 🥦</h2>
          <p className="info-text">
            Підбір раціону для конкретного виду тварини.
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
            <select required value={petType} onChange={(e) => setPetType(e.target.value)}>
              <option value="dog">🐶 Собака</option>
              <option value="cat">🐱 Кіт</option>
              <option value="bird">🐦 Пташка</option>
              <option value="fish">🐠 Рибка</option>
              <option value="other">🐾 Інше</option>
            </select>

            <label>Поточний раціон</label>
            <textarea
              placeholder="Що тваринка їсть зараз? Корм чи натуралка?"
              required
              value={desc} onChange={e => setDesc(e.target.value)}
            />

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Відправка..." : "Замовити раціон (250 грн)"}
            </button>
          </form>
        </div>
      )}

      {/* Generic fallback */}
      {!serviceType && (
         <div className="form-box">
            <h2>Оберіть послугу</h2>
            <p>Будь ласка, поверніться назад і виберіть тип звернення.</p>
            <button className="btn" onClick={() => navigate('/category/vet')}>Назад</button>
         </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>✅ Запит прийнято!</h2>
            <p>
              Ми отримали вашу заявку. 
              {serviceType === 'diagnosis' 
                ? " Відповідь надійде на пошту (черга до 1 місяця)." 
                : " Лікар зв'яжеться з вами найближчим часом."}
            </p>
            <button onClick={handleCloseModal} className="btn">
              Зрозуміло
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
