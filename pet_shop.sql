-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Час створення: Січ 01 2026 р., 13:48
-- Версія сервера: 10.4.32-MariaDB
-- Версія PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База даних: `pet_shop`
--

-- --------------------------------------------------------

--
-- Структура таблиці `employee`
--

CREATE TABLE `employee` (
  `employee_id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `work_email` varchar(150) DEFAULT NULL,
  `hash` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `hire_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `employee`
--

INSERT INTO `employee` (`employee_id`, `first_name`, `last_name`, `position`, `phone`, `email`, `work_email`, `hash`, `salt`, `hire_date`) VALUES
(1, 'Расел', 'Кров з носа', 'Менеджер', '+380501112233', 'rasel@example.com', 'worRasel23546@gmail.com', '9a51559c7a124398bcc8a07069c9545594602c1963edb1d2d6d82f00fe2c4d59', '9038d6819b2be41c27c0a17badef62af', '2022-03-15'),
(2, 'Максимільян', 'Пердак', 'Продавець-консультант', '+380671234567', 'max@example.com', 'worMAx9065132@gmail.com', '768e225b614e0a7fb5b625e7af3b1ff285b6a51e651b335a49c4f984c02a8688', '8627fcf6abfad1ea3d0d2571648da495', '2023-01-10'),
(3, 'Йожиф', 'Йожифович', 'Касир', '+380931112244', 'ibondar@example.com', 'worBon43268dar324@gmail.com', '35f686568ccf4e1c0a4118e5a73549334c4680f8ce405fecbf13d572633d67bb', '59cb2ea531f16baab3fdd3f5d4965df5', '2023-05-01'),
(4, 'Біллі', 'Бубертайліш', 'Ветеринар', '+380991223344', 'billi@example.com', 'worbilli1209546@gmail.com', '8832a8d1baf5ace0f140ea783792cf67ec28cde3eaa7d259c4ce901fccc2c9ed', 'c259e4e91900bf3c91e1c4078a62415e', '2021-09-20'),
(5, 'Піктор', 'Вавлік', 'Складський працівник', '+380661234890', 'petro@example.com', 'worPe430975tro90457@gmai.com', 'c848892a067ccb041dcaf612fd6a66f68b541a49be24364f5101015233016276', 'ee12b78dc1a3b44f1de79915ace2f88e', '2024-02-12'),
(6, 'Андмін', 'Біллі', 'Адмін', '1234567890', 'billiGa@gmail.com', 'wor34574235BL@gmail.com', 'e4f01c097dff0dcbbf445bcaf4e06f37f735a867b49ec79afdd81bdaabd90f49', '34a6de780b1ce653b46381e969741220', '2020-01-12'),
(9, 'Іво', 'Бобул', 'Ветеринар', NULL, NULL, 'Aboba@gmail.com', '63a4461145e0504d78c4900611f3232cf7b31ef451b79bc980563661f153353d', '5bc9edb683408134cc50667c5763a12e', '2025-11-27');

-- --------------------------------------------------------

--
-- Структура таблиці `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `location` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `inventory`
--

INSERT INTO `inventory` (`inventory_id`, `product_id`, `quantity`, `location`) VALUES
(1, 1, 49, 'Склад-А1'),
(2, 2, 28, 'Склад-А1'),
(3, 3, 193, 'Склад-А1'),
(4, 4, 150, 'Склад-А1'),
(5, 5, 80, 'Склад-А1'),
(6, 6, 100, 'Склад-А1'),
(7, 7, 25, 'Склад-А1'),
(8, 8, 10, 'Склад-А1'),
(9, 9, 30, 'Склад-А1'),
(10, 10, 15, 'Склад-А1'),
(11, 11, 40, 'Склад-А1'),
(12, 12, 35, 'Склад-А1'),
(13, 13, 120, 'Склад-А1'),
(14, 14, 75, 'Склад-А1'),
(15, 15, 60, 'Склад-А1'),
(16, 16, 90, 'Склад-А2'),
(17, 17, 50, 'Склад-А2'),
(18, 18, 45, 'Склад-А2'),
(19, 19, 70, 'Склад-А2'),
(20, 20, 54, 'Склад-А2'),
(21, 21, 65, 'Склад-А2'),
(22, 22, 180, 'Склад-А2'),
(23, 23, 95, 'Склад-А2'),
(24, 24, 40, 'Склад-А2'),
(25, 25, 35, 'Склад-А2'),
(28, 33, 50, 'Склад-A1'),
(29, 34, 10, 'Склад-A1');

-- --------------------------------------------------------

--
-- Структура таблиці `orders`
--

CREATE TABLE `orders` (
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `inventory_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`quantity` * `price`) STORED,
  `order_date` datetime DEFAULT current_timestamp(),
  `status` enum('pending','processing','completed','cancelled') DEFAULT 'pending',
  `employee_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `orders`
--

INSERT INTO `orders` (`order_id`, `order_number`, `inventory_id`, `quantity`, `price`, `order_date`, `status`, `employee_id`) VALUES
(1, 'ORD1761735162', 2, 12, 420.00, '2025-10-29 12:52:42', 'processing', NULL),
(2, 'ORD1761736585', 3, 6, 35.00, '2025-10-29 13:16:25', '', NULL),
(3, 'ORD1762337705', 1, 1, 250.00, '2025-11-05 12:15:05', '', NULL),
(4, 'ORD1762337705', 20, 1, 240.00, '2025-11-05 12:15:05', '', NULL),
(5, 'ORD1762337705', 3, 1, 35.00, '2025-11-05 12:15:05', '', NULL),
(6, 'ORD1764160158652', 1, 3, 250.00, '2025-11-26 13:29:18', '', NULL),
(7, 'ORD1764251291912', 1, 2, 200.00, '2025-11-27 14:48:11', '', NULL);

-- --------------------------------------------------------

--
-- Структура таблиці `product`
--

CREATE TABLE `product` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `supplier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `long_description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `product`
--

INSERT INTO `product` (`product_id`, `name`, `category`, `price`, `supplier_id`, `description`, `long_description`, `image_url`) VALUES
(1, 'Сухий корм для котів Whiskas 14 кг', 'Корм', 3000.00, 1, 'Повнораціонний сухий корм для дорослих котів', 'Сухий корм Whiskas — це ідеальний баланс смаку та здоров’я для вашого котика. Хрусткі подушечки з ніжним паштетом всередині забезпечують справжнє задоволення від їжі, одночасно піклуючись про чистоту зубів. Завдяки вітамінам, таурину та омега-6 жирним кислотам, раціон підтримує міцний імунітет, здорове серце та дарує шерсті неймовірний блиск. Це повноцінне щоденне харчування в зручній упаковці, що забезпечить вашого улюбленця енергією та бадьорістю на тривалий час.', 'https://images.prom.ua/5869884845_w1280_h640_5869884845.jpg'),
(2, 'Сухий корм для собак Pedigree 3 кг', 'Корм', 420.00, 1, 'Збалансоване харчування для дорослих собак', 'Ви хочете, щоб ваш собака завжди був енергійним, мав блискучу шерсть та міцне здоров’я? Pedigree — це класика повноцінного харчування, розроблена спільно з дієтологами та ветеринарами наукового центру Waltham. Упаковка 3 кг — це ідеальний формат, щоб забезпечити вашого друга свіжим та корисним раціоном на тривалий час.\r\n\r\n🤷‍♂️Чому власники обирають саме цей корм?\r\nМи подбали про те, щоб у кожній гранулі було все необхідне для щасливого життя собаки:\r\n\r\nЗдорові зуби та ясна: Спеціальна текстура гранул допомагає механічно очищати зуби від нальоту, що є профілактикою появи зубного каменю.\r\n\r\nВідмінне травлення: Вміст натуральної клітковини допомагає травній системі працювати як годинник, забезпечуючи максимальне засвоєння поживних речовин.\r\n\r\nБлискуча шерсть та здорова шкіра: Завдяки оптимальному поєднанню омега-6 жирних кислот та вітаміну Е, ваш улюбленець буде виглядати неперевершено.\r\n\r\nМіцний імунітет: Вітамінно-мінеральний комплекс підтримує природні захисні сили організму щодня.\r\n\r\n🚛Склад та поживна цінність:\r\nКорм містить збалансовану кількість білків, жирів та вуглеводів. У складі ви знайдете злаки, м’ясо та субпродукти, а також овочі — все те, що необхідно для активних ігор та прогулянок.\r\n\r\n🗒️Характеристики товару:\r\nВага: 3 кг (зручний зіп-пакет для збереження аромату).\r\nВік: Для дорослих собак (від 1 року).\r\nТип: Повнораціонний сухий корм.', 'https://content.e-zoo.com.ua/files/Prods/prod_19296_88830305.jpg'),
(3, 'Консерви для котів Sheba 85 г', 'Корм', 35.00, 1, 'Вологий корм преміум класу', 'Цей раціон створений не просто як їжа, а як справжній шедевр кулінарного мистецтва для вашого кота. Вишукані скибочки у ніжному соусі — це стандарт якості, гідний найвибагливіших поціновувачів.\r\n\r\nТехнічні характеристики раціону:\r\nВага нетто: 85 г\r\nТекстура: Соковиті м’ясні шматочки у делікатному соусі\r\nМатеріал (склад): Високоякісне м’ясо та субпродукти (вміст м’яса не менше 40%), вітаміни, мінерали\r\nКатегорія якості: Super Premium (найвища гастрономічна проба)\r\nТираж: яловичина\r\nФорм-фактор (Паковання): Герметичне фольговане саше (пауч), що зберігає 100% аромату\r\nЕнергетична цінність: 70 ккал / 85 г\r\n\r\nКожна порція Sheba — це результат ювелірної роботи експертів з харчування. Шматочки мають ідеальну форму для зручного споживання, а соус підкреслює глибину смаку, не залишаючи байдужим жодного «експерта» з вусами.\r\n\r\nВажливо: Не містить штучних барвників та консервантів. Тільки чистий смак, який заслуговує на місце в мисці вашого улюбленця.', 'https://pollypets.com.ua/m/goods/ga/256011338.jpg'),
(4, 'Консерви для собак Cesar 150 г', 'Корм', 55.00, 2, 'М’ясне асорті для собак', NULL, 'https://doggycouture.com.ua/image/cache/import_files/ce/cec07583-cf8a-11ec-862b-acd56413e646_1-280x460.png'),
(5, 'Іграшка м’яч для собак', 'Іграшки', 120.00, 3, 'Гумовий м’ячик для активних ігор', NULL, 'https://myfriends.com.ua/Media/shop-11234/%D0%86%D0%B3%D1%80%D0%B0%D1%88%D0%BA%D0%B8/77714_001.jpg'),
(6, 'Іграшка вудочка для котів', 'Іграшки', 95.00, 3, 'Іграшка з пір’ям для котів', NULL, 'https://josera.ua/media/catalog/product/cache/b49b13586f773f31711931a0e4268496/j/o/josera_cat_toy.webp'),
(7, 'Лежак для котів 50х40 см', 'Аксесуари', 560.00, 3, 'М’який лежак із бортиками', NULL, 'https://murchyk.com.ua/img/24/4010/6918/6918-23917-lg.jpg'),
(8, 'Будка для собак 80х60 см', 'Аксесуари', 1800.00, 2, 'Дерев’яна будка з утепленням', NULL, 'https://content2.rozetka.com.ua/goods/images/big/255163751.png'),
(9, 'Клітка для гризунів 40х30 см', 'Аксесуари', 750.00, 4, 'Клітка з колесом і поїлкою', NULL, 'https://images.prom.ua/6264371729_w300_h300_klitka-dlya-grizuniv.jpg'),
(10, 'Акваріум 60 л', 'fish', 2300.00, 4, 'Скляний акваріум із кришкою', NULL, 'https://images.prom.ua/4098646482_w640_h640_4098646482.jpg'),
(11, 'Фільтр для акваріума', 'fish', 900.00, 4, 'Внутрішній фільтр для акваріума', NULL, 'https://zoocool.ua/image/cache/catalog/shop/products/39/10/1039/images/21618-1000x1000.png'),
(12, 'Обігрівач для акваріума', 'fish', 480.00, 4, 'Терморегулятор із датчиком', NULL, 'https://content2.rozetka.com.ua/goods/images/big/18240249.jpg'),
(13, 'Наповнювач для котячого туалету 10 л', 'Гігієна', 150.00, 1, 'Комкувальний наповнювач', NULL, 'https://content2.rozetka.com.ua/goods/images/big/471876547.jpg'),
(14, 'Лоток для котів', 'Гігієна', 200.00, 5, 'Пластиковий туалет для котів', NULL, 'https://optimeal.ua/images/product/large/664b904954d3fa739891097e610dcecf.jpeg'),
(15, 'Шампунь для собак 250 мл', 'Гігієна', 180.00, 5, 'Гіпоалергенний шампунь', NULL, 'https://zoocool.ua/image/cache/catalog/products/25627/shampun-dlya-sobak-porodi-shp-ts-doctor-vet-250ml-5-1000x1000.jpg'),
(16, 'Гребінець для котів', 'Гігієна', 95.00, 10, 'Металева щітка для шерсті', NULL, 'https://content.rozetka.com.ua/goods/images/big/271159136.png'),
(17, 'Миска подвійна для собак', 'Аксесуари', 220.00, 6, 'Подвійна металева миска', NULL, 'https://myfriends.com.ua/Media/shop-11234/%D0%9F%D0%BE%D1%81%D1%83%D0%B4/%D0%94%D1%83%D0%B1%D0%BB%D1%83%20%D0%92%D0%B5%D1%80%D0%B4%D0%B5.png'),
(18, 'Поїлка автоматична для котів', 'Аксесуари', 3000.00, 2, 'Автоматична поїлка на 1.5 л', NULL, 'https://cdn.27.ua/sc--media--prod/default/ac/bf/d3/acbfd3c9-63dc-4ae3-9e3b-cb65830f6524.jpg'),
(19, 'Кормушка для птахів', 'Аксесуари', 700.00, 7, 'Підвісна кормушка для птахів для вулеці або будинку [SALE]', NULL, 'https://content.rozetka.com.ua/goods/images/big/26201126.jpg'),
(20, 'Вітаміни для котів', 'Вітаміни', 240.00, 7, 'Вітамінно-мінеральний комплекс', NULL, 'https://petslike.ua/images/product/large/9d4eea8287277e1960c6c2cf07346b98.png'),
(21, 'Вітаміни для собак', 'Вітаміни', 310.00, 7, 'Комплекс для суглобів та імунітету', NULL, 'https://produkt.com.ua/wp-content/uploads/2020/12/%D0%9A%D0%86%D0%A1%D0%A2%D0%9E%D0%A7%D0%9A%D0%90-%D0%BC%D1%83%D0%BB%D1%8C%D1%82%D0%B8%D0%B2%D1%96%D1%82%D0%B0%D0%BC%D1%96%D0%BD-scaled.jpg'),
(22, 'Кісточка-жувальна для собак', 'Ласощі', 60.00, 8, 'Натуральна жувальна кісточка [SALE]', NULL, 'https://c.suziria.ua/32028-large_default/lasosshi-trixie-dlya-sobak-kistochka-zhuvalna-presovana-v-individualnij-upakovci-naturalna-shkira-15-sm-150-g-2-sht.jpg'),
(23, 'Печиво для котів', 'Ласощі', 75.00, 10, 'Снеки з куркою [SALE]', NULL, 'https://i.moyo.ua/img/products/6729/38_1500.jpg?1758527858'),
(24, 'Нашийник для собак', 'Аксесуари', 190.00, 9, 'Регульований нейлоновий нашийник', NULL, 'https://pethouse.ua/assets/images/prods/collar/0000071871.jpg'),
(25, 'Повідок для собак 2 м', 'Аксесуари', 250.00, 10, 'Міцний повідок із карабіном', NULL, 'https://zoomagazin.dp.ua/image/cache/catalog/pho_pro_clip_1970116_970016_2_sall_awk_v1_1_116-1200x800.jpg'),
(26, 'Корм для птахів Vitakraft', 'Корм', 385.00, 1, 'Повноцінне харчування для птахів та попугаїв', NULL, 'https://brain.com.ua/static/images/prod_img/9/3/U0747593_1739683635.jpg'),
(27, 'Корм-ласощі для екзотичних птахів 140г', 'Корм', 95.00, 2, 'Корм-ласощі для дрібних екзотичних птахів', NULL, 'https://zoocool.ua/image/catalog/shop/products/88/31/3188/images/24439.jpg'),
(28, 'Поїлка для папуг Trixie автоматична 75 мл', 'Аксесуари', 210.00, 4, 'Універсальна поїлка для птахів у клітках.', NULL, 'https://images.prom.ua/3198443904_w640_h320_poilka-dlya-popugaev.jpg'),
(33, 'Корм для рибків', 'fish', 250.00, 9, 'Корм фасований рибок Tetra Discus', NULL, 'https://zoocool.ua/image/cache/catalog/products/3428/korm-fasovannyy-dlya-akvariumnyh-ryb-tetra-discus-usilenie-okrasa-100-g-1-1000x1000.jpg'),
(34, 'Сачок для риб', 'fish', 350.00, 9, 'Нейлоновий сачок для ловлі рибків', NULL, 'https://zoocool.ua/image/catalog/products/20273/sachok-dlya-akvariuma-neylonovyy-fish-net-fn-4-10-h-7-sm-ruchka-30-sm-2.jpg');

-- --------------------------------------------------------

--
-- Структура таблиці `sales`
--

CREATE TABLE `sales` (
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sale_price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `sales`
--

INSERT INTO `sales` (`product_id`, `sale_price`, `original_price`) VALUES
(19, 55.00, 110.00),
(22, 48.00, 60.00),
(23, 56.25, 75.00),
(34, 315.00, 350.00);

-- --------------------------------------------------------

--
-- Структура таблиці `supplier`
--

CREATE TABLE `supplier` (
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `supplier`
--

INSERT INTO `supplier` (`supplier_id`, `name`, `contact_person`, `phone`, `email`, `address`) VALUES
(1, 'ZooFood Ltd', 'Семен Сигмундач', '+380501234567', 'info@zoofood.ua', 'м. Київ, вул. Хрещатик, 25'),
(2, 'PetCare Group', 'Аркадій Пончиківський', '+380671112233', 'sales@petcare.ua', 'м. Львів, вул. Зеленa, 10'),
(3, 'HappyPets', 'Фелікс Мандаринюк', '+380931234890', 'support@happypets.ua', 'м. Одеса, вул. Дерибасівська, 45'),
(4, 'AquaWorld', 'Гоша Підшлункович', '+380991122334', 'contact@aquaworld.ua', 'м. Дніпро, вул. Центральна, 12'),
(5, 'VetLine', 'Родріґо Чебуреченко', '+380661234555', 'office@vetline.ua', 'м. Харків, вул. Наукова, 3'),
(6, 'AnimalHouse', 'Блаженний Гопнік', '+380503334455', 'info@animalhouse.ua', 'м. Полтава, вул. Європейська, 77'),
(7, 'RoyalPet Supplies', 'Панас Пельмененко', '+380972223344', 'orders@royalpet.ua', 'м. Черкаси, вул. Смілянська, 19'),
(8, 'NaturePet', 'Жора Бублєнський', '+380671234999', 'nature@pet.ua', 'м. Івано-Франківськ, вул. Незалежності, 56'),
(9, 'Fish&More', 'Серьога Малолєтка', '+380931118877', 'fish@more.ua', 'м. Запоріжжя, вул. Перемоги, 33'),
(10, 'PetComfort', 'Толя Пєрєходнік', '+380991112299', 'comfort@pet.ua', 'м. Вінниця, вул. Київська, 88');

-- --------------------------------------------------------

--
-- Структура таблиці `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `hash` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `registration_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `hash`, `salt`, `phone`, `address`, `registration_date`) VALUES
(2, 'Anton', 'Anton@gmail.com', '0e8f5e49be73df8a03943a7400264be5bbadc4b64b4731fa9eced2f0c6710f73', '7463de555218b28766d2a73e4d5f19be', '1234567890', 'Абоба', '2025-11-08 17:44:32'),
(3, 'Олег', 'Oleg@gmail.com', '14f355aac3dabeea517316e389422171084b3f5d33d02816e632548405f08e10', '913d697e36191dfd6568c6fd448927f4', NULL, NULL, '2025-11-21 08:07:03'),
(4, 'Користувач_123456', 'NewUser@gmail.com', '5b806a928b21a4ecca19d2049b85229bf216fb2777ba8a53053b2b6cea9ac45b', '355123ace2616f3a5fe956e6b067670c', NULL, NULL, '2025-12-10 06:02:41'),
(5, 'Користувач_1234567', 'NewUser2@gmail.com', 'bc5314761ee534db0205d4d265f9b1b160ece4d0d101b78038c45e01397821f9', 'f471f875cb0adf389386728b134d3abd', NULL, NULL, '2025-12-10 06:06:54'),
(6, 'Користувач_1_111222', 'NewEmail.@gmail.com', '36217de45adfe5e6d71ead1c39f39519d6420b875802c8f98e84e5d7a28b65f8', 'e67eb37e91c84569a4a315d0c5873ac6', NULL, NULL, '2026-01-01 11:47:03');

-- --------------------------------------------------------

--
-- Структура таблиці `vet_requests`
--

CREATE TABLE `vet_requests` (
  `id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'New',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `vet_requests`
--

INSERT INTO `vet_requests` (`id`, `client_name`, `email`, `type`, `description`, `status`, `created_at`) VALUES
(6, 'Мойша Халявщик', 'Moisha@gmail.com', 'diagnosis', '[Тип: Діагностика по фото]\n[ATTACHMENT]data:image/jpeg;base64,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[/ATTACHMENT]\nСправжній хохол каже що це тупо зрада', 'New', '2025-12-10 08:29:00'),
(8, 'Ізя Кайцмен', 'Iza@gmail.com', 'diagnosis', '[Тип: Діагностика по фото]\n[ATTACHMENT]data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7KCIoOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAD3AQIDASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAAAwQAAgUBBgf/xAA7EAACAQMDAwMCBAQEBQUBAAABAgMABBESITEFQVETImEUcQYjMoFCUpGhFTNDsSRywdHwNERTYoKS/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QAJhEAAgICAgIDAAMAAwAAAAAAAAECEQMSITETQQQiUSMyQhRhcf/aAAwDAQACEQMRAD8AJ+MPxCnSrM2sXuuJR2/hFfL5FM8hmY+7k1qfiPqL3/Wprhv0htI+wrNGXyw2AqEqVCSo5HKxcoTjbijo6xMoBwe5oNkuu4Z23IGwrt7rXYjJznbtTGMxrJcexxp1bk96uzQRg6t2B2Nds39K3LuDvsT4FCklhk2iGTnapGNKtu2krsMZ+9AmSIagNseaEFmmukce0KODR+pkvcKq4VtIzgc/NAAomS3TCsDnnFSRhqG4XPYCgiPUdLnBHHijzwJKcrJlxj9NMAsVvPE3tBCMMnbYijGBGAcsuzbYqStcpZRwKSVYZHkeRQEjP5cOrST5pAakl0wXUZg5jGNHO1JIYpcuHBz2ojxQ2cwjkVnL8t4q72CWMCNy0vuVj4pALzz8AqpA2CgVyOaZV9y6I+QPBpy46fEEUg6CDnK770cLrdHmaMog3TGM0wBXM11cIixBY3Pfgk0lLcXVgjRzrlsbEUe9nubiNjCV+MDGPFD6ddC8Ij6ivtB0lh3+TQAxBcF7T12TV6YyGI3FPdMMfVXc3CjWo2B71m9WgFuvo202qPIIC75rYuntundFiaPP1EiAgr22pAEt7S1uQUikRWXbY4I+KLbW0VjdhEmyoUlBq/rn5rG6S0Uk8ckjKkkhOUH8RrRuFS1lYC3/AChydRyCfmgDnU7+KSUa4j6YGC3k0EwQl4oI42dsZBB2z/4KWR0m9SL6gqU2yR7SO2a7LJ1HptvHIpiZFY6G1nb9qYFunQzx9XkmkXVGvtz4NNxmxea4EzjUwOg+B3pfp3WrRLUx3QJlB1ZG2smqSmH6tZpV0Rt/Co3z80gCLFEmMHUmgMhPitbpxjRQy5GCGHg4Nece6ebqDC12jijC4+Pmtm3R1t0lBYK0ed/NMk9mjZUGrgmloGPopnxRga6SQoOa7iqA0QcVLGiaaldzUpWOj4fdMwvJUYZ95zVXYA6cbEUe+APUJgOzn/ehzA4ACkdy1ZjB2cginZnIzjajoyyXALDVvVre0VoDO/uwcAChmNIZw65UHse1IBx1CkCRsKfHakLpfp59VsfZznHejyMCdTg6cbGjOsKqCWUAjf5pDB210/o5dVLg7URZF+pBZgSV2Pg0tAivcM2rEee1NCygGp2l27DvTAkkXqOqMQO5PmqSW0tnMoXbUNs96P6STRqQxAXnNEYINJL6zjAPikAHN3JHmRWJX9Jq0aPNp2LOMdtxTJnVYdGvLeabtontrcTsNIf+JuT9qAFLa6hjjkiuoiJGfCE70WaLXKqyt7QPZngUtOgmYx6SXY5G24pmG3EqLJJJnbGPtSAtBeylxEoXck5IzXJp5btxGwXAXIA7mgTNCl3GsJOhSAxx/etVIoY3RmcEauR4O9AAbO5s4j6cgAGnAJHeqtYwT2l0kTAkYxg7n/zeiXsNutw7KdJJ3BGxzS6/lKphcI7ZOTtQBcdJW1uYWzqOAdOeBij9WgEllreJlK7DA7HihyXbGOOUnVKow2nxTw6hJPE0ejXGy444oA8/cdKube1ivI8nOG5zijzXyXkcYnDiVnGsjYBfNPIZbZgD7oicOpPAzQJoIZGkuYW/JQgYIwTTsAHUIZh6j2K4hbGdO2aftLOTqlqkc80cLJ+lO7DFCE9rdSehAcALuD2NMJHc27JANOoDMbAc/FAjHNkYbpxNFmBjpDjzT8lgsgih3JCZb+uKPNDIkbSaI21e4xjzSAvZLp0khV45BlHGfmgB+bp8XSINSqH9VBqPFF6UGujBArMUDZwfFDhlaXVaXI2k/iO+MVpdK9CDqKxxH2oSKcexM9Kq6QAO1d3q+M1MV02RR1atqriiulcVLKRNVSqVKAPjMrhOpyjkaid65cSa1DDbJ3q88TG8diRnPHepJEJZVThTWLKCWEyLEFeTI3ODUV0lieNAJHPJI4FWFrBHHIRvoFCi9sLiNWAfGCKkZxlOnQ427Y7UIv8ATsY296ldj4pmxDq7auR5osohklAmXng8UABUKtsoUfJqyrhQ7ksunH3pkvB6bDTlgMKOxFVhX0GVHUkHfB80ACE5iQxojYbuRXYyJXCs2AOa1kjwukgMOd6TuLVRK7oQM8igDn0eUadCHRcagOaflufXNsTukQwV8EDakoIWtYHAlyznGnwPmjxW7W10jn3RSDSwP+9IYeC1kmuUuQM6DlhRLe1jklkK6lJJ9h4zXZOsLZB1txrB2O1ctupIwLBCJG3IIoATtnhlk9Jock7EijXHTJ4JlhQtpY5Bz2ofR7hf8ZMsiAbHSD3NeinuVuJRlVBwScfw0AeelQS3kcWGzIwU5rnULBob1RESVX25J2okQlS8bLHOrKkjb+taVyqSIVZsEsGzQFC1nZG6j9Y/leiSrDgGrqBDO8SjII3xTF1iKKNEJZXcatPJFWMSyXsjqMewDT3oChaSFTbNHExckEux2xVrbo7zWas5zrBJHYY4NL3rywwoI5Mkt7gOSBWzbXyW1suohtcenHg0AeUt+nyw9TlEgIMQ1DwfmtS0vJA8UrFSM7DOTTMjm4kUFPzApQsO4pD01S6hRRlkyPtTEHuruLqDeiqm3ZSza32/ak1RbWdHVQ/Z15z81oXdvDIFBZWkzhttqt6bEpGwQFAQCPmgR1Ly2lcxyBo0ONTBcED96KI4YZne3lMgUA6/NIS29x6nqvMGXZCCN/vTtpbfSlZCuRqAIH8S+aBHrLWUSwI+c5FHrK6bLh3h7A5HwDWoDW6dokuoqNxXAcVxm2pFFKlc1VKqibPj/UMm9kMQOS/euSOsZyRkrTPWo2t76SNedRI80pGhPuYZY7YrF9lIsAdBlUkgjceaO8sn0ymMBVGwoUbj01UYO+GFMXFyluyqEDBRgY81JQmrXUE+tyCCvFGiu2uHAkhDA7AntVEkWW6BZCA3znFa83pxR5j05xtihgKmEepGAoJ+KLf28iQLMMqwOGXx812yuVDBmTuMn4pq46nGFkixG6+e+KQyvS7yKdgtwBqxjUK71BrZZmCgkIMlRWfYTRiYsyllNduE1TyBA5BGeN6PYDv0ont1uLRsBuSeQajT3KpGJoyqg8+T2xQujXn0/rRFSYnGDnsfNaqyWs9g0NwzpKhymRsfikNIz4k9a5CH+LkeKbW0WGN8DJAIH/ShWskMchc5VuxIzTSzg7qGbPkbVLkkaLG2zOitI43ErvhgeQcYrRfqNssJAY6jsxAofpRhi7hQDvvS09zC59KNC5/lQZNRudCwcHYrmWZvTgXUpBDOe3zR7KQfRvDNL+cjZRj3oEFlfkEJEIlP87Yoy9OjTe4nyR2FNzJWAl11EwwZRAZe/u2qnTepu8ojMWZZRjVmi/8ABrlEXUftVYIjDIGiGMZxkcUKYPDxwWudcE7yIgdlAOk9qXmMzWkbRKxYSE48U5iRfUZhlnXTmqwgrAYpWKg/xLuardGTxNCtxcaYMJJpY4947mjmw9RFusncbjVg/NKXrw20S26KXXgsRjG9aMT+oXXIWPTnUxwM4qrM3Fo60gjjWSGLUQMjfO9JuJQ6T+rpMmNYIo9lbTSStIxUbERqH/V+1J3EdzDetBJETHnKnsKpEM1cxz6QCVVh7m+xoM0kwuhbK4RY21Rt/MKpDE92wiUhdLBix2wPNO3UNu3oxlyGX/Lb+9BJr9JUmWWQ85xWsDisbpbyRxp6v+ouoHyK0/UFbwVohumMaxiqH3UPWK6HFVVBtZ3RUrusVKOQ4PnX4tgEfUgyj3SjNYTlkIJ2AHHmvefiGwF1aeoqgvHuDXhZrNjISxIAOKjLGmGN2ijwOp1oed8CjtZmddeo5xk0R3UIsY9uBtV1lMraAcNxsaxNReKJ9XpqTvsciixW/pyr6hJBG1Mx2kiKZgNQU7ijXcIikjx7wq5GO4NKxg40/JlAG+oEUhIrMzagcn/ataLTJEModPDAcr81V7NmAOsPH3J22osCnTksniDSy+ng8Hg1qvc2CFQjKZI9IyP4s1gTwhIxFHls8U3a9OEiZaJs7b5qXJI0jBst1C3QXP8AwoGmQAuAeDRorK6dApDFfk07DaBCCwBIpsZxscVjLJfR148KXZniwnHCAfvVvopiPdMEHxTzCTB/MoLRDl3z8Cs7ZtSFhYW2fzGeY/LYH9qKbhLZPTtokU+FGKrJJpGFWhIjO2SMCqoVh1juJxmafSv8q8136O2X3OC3/M1UecQrvSUvUE3ySx8Cmoic0jRWaCL2xoB9hUa5CjIGaxJOot/pqF+aA3UJH2JJq9DJ5Eb4v0f2uMD4q+FIDAhge9eaM+TkEg03bdSeE45Hg0akrJ+mvNCkijKjwaz5+nsJFlQkhTnTnY0/b3cNwmB7WP8ACaMRvStofDFLe5CSN6bpE7DSC5xpHxVzcyG5S0jcSgcyMvbGTUurKOeM7b0rBdrYOsRCvhTnV2HitIuzCcaAojyF3nlEaBzkn+IfFbUwtFt4g2pXKAgA5IA3z96xr0i5YXLN7FYadtsVoTXklysDxKCQPeQnO3mrMGegsVjPTA+PfGcBtWc706KwunDTbK2+JG1af5d63hxXRifZjNExUrtStrMyb+alSpSAXZQ6FTwa8X1y09C4dFGF7fevbVh/iS3VoVkIHyaMiuI4OmeUWIPsxAOOaUeRhOCpB0nGRRb4ux/LBC9j5q1nYo+p5X0Rj9R8muM6QsXUZQ5jAGCu9adt6c6RahqGnBZT+k/IrMksWlcG1Vj235xTj2txDaqksBDrw68j+lJjGWghtiXjutPnY70rPcSXcuiNzoG33pZ1kChpGJz2J705ZxgKWFRJ0awjbLQ2qqwdzmnkuIxsvakL25WNQitlj4pBbkryTWWrZ0qSiek+pQrVROuc5rzx6ljgmqN1ORtgCKNCvKen+oTGM0MuvIrz0d+wO5NOwXgkHNGtDU7NBnVt84rgcKeaWVya6clqVFMHdya6QKnfFMSnc5pcuOK0Rg+WUWEZ3NGEMY7Ch6hR47aaQZCmhsVFkgRuwopsEZdjg0I29zHwtVS6dTpcEGptjpFxbzQnHI+9aNvKWQBzuNhvSSXGo4J2pqB41cbc0WKh8ZA34rz/AFvVbzwyImrUdJArfzqT5rK60rmFZUO8bZqodkz6BW0yXls8cihQQNI8VopgQelGNOlRuO5xxWfY6LsJgGNhgt/LitM/mOwttWV4AB91anOw9r75RLnQQuNPavRocoPtWZaKqdNPqKBIRg/BrRTdB9q2w+zDIXzUzXK4a6DItmpValAFKQ6vCJrMqR3p+gXYzbMfG9OXQl2eEu2xelXYYxhR4q0skNrZiInU5OrNDvIDcXTsM8+KHJZmRQucn5rgOs3bOSP8t9WARsRUu7swQrNbhfzCclj2pBLaS1gCRs25wAeN+ak1qCgWZzmM6gB5qWikcWF7t9bmuXFwIB6Ufbk0e3J9BiuR4rPnGTism+ToVJC5LSyFq79OTyaKAsaZJCj5ris82dGEQfxtVWFA2gRRkmhMYwdqYaaxgHudpn/tSkt3E5GiMjNOmw4RfUtFjkCtkGlC4U7jFFVSy6l3FJjTPRW8QeNGG+RmmDBjfwKp0pCbKEkb6afdDg+Kz9nT6PMXTHfHmlNZz3rTntiHORtSj2qEf5hT9qtHP7AxSqjZb+9PJ12C3XSwJI8CgQdPjDajIX8GuXHTUlcsGdSecLkVSoTb9DqfiC2fGYmAPxUmubK4UlW0v4xvSMXSwrLu74OQNOBWjFZQ4JlAyaTSBNsVVSwBApyBSME00ttC6YiGAKiqEfFQWkNQDUv7UC+i1W7bcb05bqdGx2rs0IeJgdjj+tNdkyRiARxPH6be0rg4r0nTrZ4rUyi5zhRpAGP/ADavJok0Fy2Yg4B9ueK9BY3b3MTeqiooXdRtn4rU5madwV+jDYU6jkgnBx2NOLui/asaSWa4mCtAYYQvtI3H71rxNmJT8V0YfZhkL1K5UrcxJUqZqUCKah5oc5HoPv2rBW7lO3uqxuJSCPdT2ROz/DLlYRgouASTvSmHJGD7idlod9JJFctnODvTHSvzpvVY7DtXFJUzsi7QwZ54gFZAXByFHas3qd5JdXCsV0ZIBx3rc9NSDk7kEb1i38axMsbY9QOP2FQWjTtkUWy6fFJXEDa84rRhwsYxRTEknIrBvk7FG0efe1kmYAHftmqtYzjZmJHgV6D6WMjCjB8ilp0lTIUBwPGxpqQOBjP031SCSU84Wrr063iwWDN/zn/oKYklmG3pmgGOaY+7Iq9mToiumH1MKms/NORWzyjBXCjxR7OwwQdIA70+yBRpUVLkXGA105AII0HamZRyuKBYIfbTMgy+KhHRXBmTxe87Uu1ijg5GM+K0pYzrqjIdIHiqMdTBmsZoGzG5x4oQkuEO61uvs2GHtqjWsb7riixamSs8x2waYjDM3uVjTwtAvOKuI1Vs0WNRBQl9PG3gUwqgkZrnIx/eug6Qc7+KVjobhUKAQSM9qtONMeqgwSErgbHGc0Wdw8RHgb00ZyPOSyTLJKBOVTVkKK3LEqLZXIL75O1YUiM14u2+ePNbUKSrKsrvpiIxpB4rZHLJDUZE5Ugkam0mtdQFUKO1Zlroa4UxfoQd/NaWoea6cSpHLkdstXKrrXzXGmRB7mArW0RRepS/1sH84qUbL9CmeRE8g4arC6mHBrWazsQM+oBS7Q2OcC5Fed5B/wDFkv8ARi3Ye6lUMBk1X6S4tMFXwG4INa72VvJvHcrkeaoYLlP0NE4Hneq8iZvCDiqbMiW6ulnWF5cRk41dxS86LG5cvqJP6idzWhfwS3DIBEqb+5s80e46P6tuEiQE43/70OSN8cdmEtJNcCnPamVbbbms/payJbMkow8blSKbzvXPLs6o9DAbLEKceTXHtEk4LZ+9AXdgaaVjp22qbNVyBNmijcZq0dtHqGEoq/J1VYjUp2NOw1KAjJVe3ippzueTsKuwWNP9hXY10vltyBnFBSQ7bBE0r3HehyEetqOf2q6yKVzkr80MMmpiN6aKo63vBJGMcUN/txRlkUkasYqMkTAlX38VZDVCrKrjBoLRmM7cVa8V7YCQH253q0cgkGTUskqrg7GrbE1xlGcihliKQFnIXfG1DYgkeK40hJwaoX3wCMVSRDYxFIAQO4GKZQ+rGRnms9Rvtuc+eKdt5NwoOwPftQZsxr23uY75ZVUmPP6vFados9zb6Suksf1fFNPcpbR+s4yqnJ2qqddtsDCFR9qezRg3FcMdhtWhHtIBxXfRmyfzKBH1m1f+LFFHUbc8OKyse0GXWCQf6lca11/qcmq/Xw/zUCfq0cX6VLfai7C4IP8AQp5/tUpH/Ho//if+lSnQbw/RI2dgw/8AWf3qn+E2BORdf3pyL8LqucIxI3yTSV70syXCrj0wNsA8150Z7OlNhKNK3EOnS7EDa5H9aKthbqPZdD9zSr9DUldDMAOd60m/DVtcW6+jIVYDc6qieRRpubFGCl/kB9Ch/wDcIf3qs0MkODFKCfvzVZPwjdiMuk7bf/agRdCv0jaRZmyvk1eLLFO97LjHR8RKxxurOHHukOqq6jnBpiS2uYtEsxBVxjbsaWkAXJHNd8ZqStG6d8hEIFGDZIz/AEpONyMbbk0yrDGSeadFph1z2rpcIvzQDNpGc0lcXTHbUKaRew6LkNLqY7INvvVXv49WQ1Z5ngSA6pASfFZEzlWJUkH4NaKFmbyqJ6UX4xgNXDfN2favOxXLHYtvRjPgbtT0DzJmw/UDjANKydY9JsaizeF3xSBul4B2oTTBV2UFfIFUomcsptw9Qa5iZDnDdjTaDSoI4rz9v1FYlKlQCO9Pw9YhIw4P7cUnFjjkizW9XC+a43OKBFcwTbI4PxUkDp7gcgVnRpaZZxjehtxsaKkgdeaVkcYIzjzVGbYVZSCODTEDqW5OTtSIbUuByKPG5yCOeM0ED1wVFpLrAb25+9eaTqUbSEH9I7V6Z1EsQjcFsjBFKL0e3Qljanes55VB8qzCWPZ2Jxy2rIG04oqtbjcEj96dNnCE0Lbtj7VUdPjzvAxFcrnfKTI8L/QUckXY5oweNuwqDp6BtoXxVltAmcRvWbb/ABh4pfp3TF/LUq3pD+R/6VKu/wD0fjZsr1W6axb8pQFGCc7158zzNcklSe+TSv1l5b51NrhPirR3jM4bUNJFZYvjLHbS7CebZo1I5riGMSEAq3ntTtjeRwTxplTrpOwuIrqzlimIbSdsGsueNoZg6SacHYVCwrJcZcGyyaU+0ewvjcCdRF+k84rFvrq7t5TDGBpY4LUS161cekFYgjjNNrB9ZbyFl4GQa4lj8EvuuDq380fp6Ery3kbp+vUG07msKRxjI5xua2ZJyvTzCXB7Ed6wJDo1bd69T4iatMw2V0ixcLpI7mietuFG5pPUe/arxuCcHvzXfRSkS6ufTXJrNllLEtJtjtTN2wWTsT/sKyZpC5IyT81pCJnkyei8ly7HCbZqhbbBOSfNcVcjP7VUjJJrQ57O5xmuF2bk1ZVOMVxVJIpgdjY5IqzbNtmuemU3xRSoK/IpAAJ8/wBaur6RyAav6eF2xiuaFKjjNAUEE8i7hhg9xtWz0/qOoqjktnuxrAzgaf70W2lKSKQODnGaTVlxk0z0uPRusD9DDI+9KS5acjNMh/USJh3FLOPzi37VlRtZ2NyDjGfk0xAckA5IJoGkkZH9KYg5Xtj+9AjXtsCaLUOTWjcqusIr4FYqynOBnI4rYtrVbljqDb15Xz7TUr4NMau0K/WJCxRvdXYr8wq5I1E8A0G6isoLnSrkv/Kaa6a0TXTRzRbY5NctrW1ZC22pgoutIVIKAE/2olrdGUkL7smhdasIrJxcW4DK/KjtXenXUcECuFBJO/xRxLHvCxxU3k0ZqaR4FSu/WQZ/StSuPbL/ANnVqeKmgkC6LbcHnNUSwW3Rnkc5PIFP2hNwFZVKpnc031PpzLYGaE5Pmve8+klBnkRxza2S4MeBl0gxPoI5B705/mKHkG61mwXCRKUmUau7VoW91C8ejUDmrmmuSG2I3E1ykjGMNp7YrasuuyRWJhkZQzDk0o7qq4GKA0KXCZmKr4rOSjljUkVDLKL+rCRSQPN7pNTFt8Hmp1OOJZT6f6GGRQI4kgLNGoyv96KS10rN3XtVpVJNdF45tPkQK75NSPIcDzRtG2/mqacZIrqOoyrtjrYA5JO5pNVLGmLvPrsB2Jq9oodvcBtW66Oftg/SkwABzxR06VdMuSFX7mtqGyj9FXZcsd6KfZseKhzN44b5Zgt0m8A2CMD4aqf4fdLj8r7biteV4V92Sp+DQDdoNsk0bF+KAg1ndMMFFGPLVeOwmJ98kajvvmmWuFYk+a7EY+cE/c0bD0igQ6dniTP7UJ7Ax43JzWkrZ27URgrLpIpbEOCZgyKCdOCMc1VIyrfI3FN3VvpfAHPJoSqRz2q7MGqZpWUuY1VifgZ4q5VhJzzSNq5SUAnfNPH3k7533qGXFl84TC+d6PAMMMnC8mlhjVkD7UfOUGO53+1SWN27l5l2xvW2L6S2hOl8N2FYtqP0k4270xfxyGNJoyfZ+ofFcvyMSyxpjbcY2gJVnvWlkQvIdwRQLjqU8V4FkGg8GipeyQEuAN/NGt7T/Fgzuo1ea5WlHmS4Rinsqj2CuppmiDRyavg1WwmZXczghSOKDHBLbX5jJ1qp4zXeoSs7lW9oz22q1GP9V0zNOa+zfKLNcOWJV2xnapSowAPeP61K08UQ8sje6Zbx3dgYhIFZTsBTs6fSdKdZPcAPNeN6ffztL6lrnbkGtsXEvUomhmJVscVy5/jyWS74OzF8j+PQ8+YIz6jMrMScgU7Z2IuliYZQLzRhCsT6Tvjar20oW4KsCByoFd7yNr6nBHmXJrS9Ktriz1RHdN6yHjiddIYah5p/pHUFa9e1fh9qzuo9Okt+psFOI85GK48bmsmk2b5oJx2iD0iMk5/amprfT04XFrj1se4ea4TE6MukZA3oUYlWNjExx3Wt3tJcOqMISS7EoJJXgDyrhgcGuq+VwT/Wi+jJOCyAjHKnvSYl0ymJ/a45BrribwnaoQuV/MfbctRbG3MjBs4HeuXP+Z+9O2AKqcd98fNbN8DS+w+JtC6ecbYqOrOMsuM1wMAMlQTVzlsHOaxOpOxGW3O/iljatnitb0HbkDFW0JGu43p2GpkCyfPxRUtyp4p/IPaodB5O9MVUARFWrcnAohjXmuago0gY/wCtArKNGmnDDc9yKTntRnVGNuCPmnHPO+aquSwz+9NGUnZnY9OUbbmnVwmNtzxQrhMSjHGrY0ZcswqmREKkekYPfmrx4JwBt2qskm2gH71aLY1BskPRAADHanGk0wEkZAG4pKM8USaTTbSZ/lNZs0SvgyhdJdOY9SjG+Kf6f1OOxmVXJ9Njg4ry9tbXN71BUtxl/wBR3xtW3bWjz9SNq5CuRnR2BpPEpRr9H8n46x5P4z0N902JlW/tH1LyQK8v1IR3dzlXYEcitqaS66VbNEFbSRwRtWNGxuZCdGjO/wB65sGGeNvZ8Lo4sk1L+pdbRNA2bipTwlIAGnipV+Ri8cf0SggWwnUqDpI3xWhbSx+oWj/UfNYE11exXCAIWHG9aH18kMQd4gNt6vJjb7MU6LXsyRXClpN2NNyQJIiOjYYd6xry9tJ4w5A154rSWeJbFHVgPjNJ42kq7CvZeGIRSeodmXcNTRuzdkszKSNqw7rqnpjSV9p70Dp97GufcdzT8DnzLsrZ1Rr6BGWYtnzS0HUG9V/YQg710q8gZ4icY3BrMH1as0Sj2n4q447X2M6Ny2vIZXJjYZ70r1CzSRzPww71lxxr0/8ANbUHPatfV9VZBl/VjtQ8ejTiylGmZbx6lEh4B5pm3YDnFWe2aJQWOF53pcqY19RMFD2Pat2dEWaJO36gDjnNXWYxt5IpCK4GnOd+3xRBJkagQCdqmjVM0FnHJ71V2VzxsaU9UHjGDXTOc87UqLUhjbbTtmu5AOGG3mkzJvnV/eqNcMAfdTE5DfqqD7TnJqjSq4HGxNJevpOTg/FV9VdWQeOaqjNsaZwTzviuq4WMHOcj+hpNZRq52FEDgAb9qZIVwZDjHzk9qvqVAAO1BM2NlNRBk5qWWkHXJOT3plBil05phOak2SGUNLdVuPRs2UH3PsKOCFBYnAArC6jcvczGNE1lvamOxzU9ujp+Pj2ls+kB6abuHqHrQRNIoOkleCK3umxxx9cgmUlWkY5UjgVn9G6ncdOsLmJc+rCS2kjYDvWh05PX/EFuZmzqAcKP4cjOK1aroWRuWRtnt57aK4j0yoGBHevL9T/Dl1G4azkX08/pxuK9djAwaowwPNW0n2eOeOHSJsDMxzUr1uhP5R/SpU6IDxt0YBgDSS52NJXIdoiqgE0v1BJbaSOF1YmJiCBztRrJjLGxySfB7Vy+NpbWTJALW2hL5ljGrip1Cxi0ACYqc/pBrjvNEzMVzvsKLY2EtzcfUXPA4WtLaezfAIUm6bdG31Bwy1Wx9KGUI+Cy9q21gdpzGTpj8eaR6h0pbWUXcR/TyPNNZk3TGascaPGGHccVDaRNjbcd6Qj6tAIdQcKSMYpoXqpECHDnvjtWEsUlyJolzaRyLoKgk0aOCKKDTGMMBvWfcdTdmAhXJHeri7YReo7aWIq4p61IqPRW9nE7GPH6RVEhH0wXkUpNeLFMz/rolhdNdyNgYUCtHFroqFqYtLCYjldjQ1uCG3rVnhyOKzpbferTOlxBtc5Bwa4Lk0N7YjihGN6rgnkYNxmuGf5pf0zXRCTyaOAplzLnvXfW1ZAHPNcW3HfNHWIDgUWg1BgvnaiDViiBQKlTZWp2BGkcIo3NbNl0t7hxFBBLcSkZ0xqWP9BSXT1GXPfavS9Bk6nI8vTumkI92AJJBkFVG5OrsPNZt26OfLN7aoQXpM5uvpRZTG4H+lobX/Tmuy2T2spjuIHhkXlZAVI/Y16i66td3vVR07o0nrO1ulq10f1yBdy2rsPnxWf+IetWUl3DZujdQFrbfT+v6pTXJ/NnByB880NfjJTm/ZiXVhdSWRnFlcG27zCNtH/9cVbp34fvo5BPD0yaVDurpGzD+teu6FL1CS4kW+uJxfCyaOCweIxwFQNjkc7b8D70bpV8nVLLp/SH/wAV6fcNCwSWP8uNycnVjlh87VSgv0p58ijopOj58Ujtrm4MlqdMuQ4IO9M9HhgTqCSW6FNI23J/3o99dhYpbVsPKjlGbyQdzXoOk/hG4C2txZypdw3SjEqDAjPcN4xU8vhE+TJTbbD2wv7sSNCpkESF3OBgCrwXIlGlhhh/em+qXsFpbf4T05gYV/z5hzK3/asiH/PTHmtLadHMpNMfzvzUruKlaHQef/FPThaXq3qx5jnO+SMhu/8A3rEgeFpiUGljyKlSuBL6ki/UwbdfU5FXe9kt7VJiAcgcVKlbQipQ5Gglrfx3mwBDfai3wDWZjY7ttUqVlOCjNJAxA9NtRaiIJ7u5rGe3uhfmCGXC4qVK3hN2ybGrdZbNsytqFdNyLp8EaV+KlSte+S/RWUxRsSBtxTfRJEkMwRcAVKlKXR2YccfHv7s0XXIpKWPBqVKzRYuy0B1walSqIKYFdAFSpQBbFWFSpSGdqDmpUoAat5PRfUeO9bnTuvXnS0lNjKqLOoD6olfUB29wNSpUS45Rlkgm0xm2/FPWJLpvSuII2dNDEWkWCueCNNXe/wCqyuZjLA/5bREpbxJ7WxkYCjwN+alSi3+nNOTTpBbP8T9USL6aWYEJH6YlMa+pp/l1Yzj96g/Fl/Z2ohim7ERMY1Lxg8hWIyKlSp2l+iSuRhW1u0751ZZm3z3r1fT7u76dZPb287RxyjEijv8A9v2qVKcexZ5O6Bim7S3OfVb/APIqVK1xq2ZY1bGsVKlStzoP/9k=[/ATTACHMENT]\nЦе неймовірна нарна новина,В мене не має просто слів. ГОЙДА!!!', 'New', '2025-12-19 08:10:25'),
(9, 'Фрідріх Штайнер', 'Aldo@gmail.com', 'nutrition', '[Тварина: Інше]\nВ мого крокодила проблеми із вивільнненням фекаліїв', 'New', '2025-12-31 16:42:42');

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `work_email` (`work_email`);

--
-- Індекси таблиці `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD KEY `fk_inventory_product` (`product_id`);

--
-- Індекси таблиці `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `inventory_id` (`inventory_id`),
  ADD KEY `fk_orders_employee` (`employee_id`);

--
-- Індекси таблиці `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `fk_product_supplier` (`supplier_id`);

--
-- Індекси таблиці `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`product_id`);

--
-- Індекси таблиці `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Індекси таблиці `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Індекси таблиці `vet_requests`
--
ALTER TABLE `vet_requests`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `employee`
--
ALTER TABLE `employee`
  MODIFY `employee_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблиці `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT для таблиці `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблиці `product`
--
ALTER TABLE `product`
  MODIFY `product_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT для таблиці `supplier`
--
ALTER TABLE `supplier`
  MODIFY `supplier_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT для таблиці `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблиці `vet_requests`
--
ALTER TABLE `vet_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Обмеження зовнішнього ключа збережених таблиць
--

--
-- Обмеження зовнішнього ключа таблиці `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `fk_inventory_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE;

--
-- Обмеження зовнішнього ключа таблиці `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_employee` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`inventory_id`) REFERENCES `inventory` (`inventory_id`) ON DELETE CASCADE;

--
-- Обмеження зовнішнього ключа таблиці `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`) ON DELETE SET NULL;

--
-- Обмеження зовнішнього ключа таблиці `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_product_sale` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
