import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Animals from "./pages/Animals";
import About from "./pages/About";
import Contacts from "./pages/Contacts";
import Cart from "./pages/Cart";

// Імпорт сторінок категорій
import Cats from "./pages/Category/Cats";
import Dogs from "./pages/Category/Dogs";
import Birds from "./pages/Category/Birds";
import Fish from "./pages/Category/Fish";
import Sale from "./pages/Category/Sale";
import Vet from "./pages/Category/Vet";
import Help from "./pages/Category/Help";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/animals" element={<Animals />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/cart" element={<Cart />} />

        {/* Маршрути для категорій */}
        <Route path="/category/cats" element={<Cats />} />
        <Route path="/category/dogs" element={<Dogs />} />
        <Route path="/category/birds" element={<Birds />} />
        <Route path="/category/fish" element={<Fish />} />
        <Route path="/category/sale" element={<Sale />} />
        <Route path="/category/vet" element={<Vet />} />
        <Route path="/category/help" element={<Help />} />
      </Routes>
    </Router>
  );
}

export default App;
