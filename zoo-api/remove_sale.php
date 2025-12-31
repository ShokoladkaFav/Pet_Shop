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
    $productId = (int)($data['product_id'] ?? 0);
    if (!$productId) throw new Exception("ID товару не вказано.");

    /** @var \Doctrine\ORM\EntityManager $entityManager */
    $sale = $entityManager->find(Sale::class, $productId);

    if ($sale) {
        // Також приберемо мітку [SALE] з опису продукту
        $product = $sale->product;
        if ($product) {
            $product->description = str_replace(" [SALE]", "", $product->description);
            $entityManager->persist($product);
        }

        $entityManager->remove($sale);
        $entityManager->flush();
    }

    echo json_encode(["status" => "success", "message" => "Акцію видалено."]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>