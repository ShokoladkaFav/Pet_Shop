<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';
use Entities\Sale;
use Entities\Product;

try {
    /** @var \Doctrine\ORM\EntityManager $entityManager */
    $salesRepository = $entityManager->getRepository(Sale::class);
    $activeSales = $salesRepository->findAll();

    $result = [];

    foreach ($activeSales as $sale) {
        $product = $sale->product;
        if (!$product) continue;

        $result[] = [
            'product_id'     => (int)$sale->product_id,
            'name'           => $product->name,
            'category'       => $product->category,
            'sale_price'     => (float)$sale->sale_price,
            'original_price' => (float)$sale->original_price,
            'description'    => $product->description,
            'image_url'      => $product->image_url,
            'quantity'       => 10 // Або підтягніть реальний залишок зі складу
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>