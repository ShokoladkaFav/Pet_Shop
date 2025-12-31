<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';
use Entities\Sale;
use Entities\Product;

$data = json_decode(file_get_contents("php://input"), true);

try {
    $productId = isset($data['product_id']) ? (int)$data['product_id'] : null;
    $salePrice = isset($data['sale_price']) ? (float)$data['sale_price'] : null;

    if (!$productId || $salePrice === null) {
        throw new Exception("Неповні дані: потрібні product_id та sale_price.");
    }

    /** @var \Doctrine\ORM\EntityManager $entityManager */
    
    // 1. Шукаємо товар в основній таблиці продуктів
    $product = $entityManager->find(Product::class, $productId);
    if (!$product) {
        throw new Exception("Товар з ID $productId не знайдено в таблиці product.");
    }

    // 2. Перевіряємо, чи вже є акція для цього товару
    $sale = $entityManager->getRepository(Sale::class)->findOneBy(['product_id' => $productId]);

    if (!$sale) {
        // Створюємо нову акцію
        $sale = new Sale();
        $sale->product = $product; // Doctrine сама візьме ID з об'єкта
        $sale->product_id = $productId;
        $sale->original_price = $product->price;
    }

    // Оновлюємо акційну ціну
    $sale->sale_price = $salePrice;

    // 3. Додаємо мітку до опису
    if (strpos($product->description, '[SALE]') === false) {
        $product->description = trim($product->description . " [SALE]");
    }

    $entityManager->persist($sale);
    $entityManager->persist($product);
    $entityManager->flush();

    echo json_encode(["status" => "success", "message" => "Акцію активовано"]);

} catch (Exception $e) {
    http_response_code(400); // Bad Request для зрозумілих помилок
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>