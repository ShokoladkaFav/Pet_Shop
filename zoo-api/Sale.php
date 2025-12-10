<?php
require 'db.php';

try {
    // 1. Вкажіть тут ID товарів, які ви хочете бачити на сторінці Акцій.
    // Переконайтеся, що товари з такими ID існують у вашій базі даних!
    $ids = [1, 2, 3, 4,]; 

    $repo = $entityManager->getRepository(Product::class);
    
    // Використовуємо findBy - це простіший і надійніший спосіб 
    // отримати товари за списком ID (Doctrine сама зробить запит WHERE IN)
    $products = $repo->findBy(['product_id' => $ids]);

    $saleProducts = [];
    foreach ($products as $p) {
        $originalPrice = (float)$p->price;
        // Розраховуємо знижку 20%
        $discountedPrice = round($originalPrice * 0.80, 2);

        $saleProducts[] = [
            'product_id' => $p->product_id,
            'name' => $p->name,
            'description' => $p->description,
            'image_url' => $p->image_url,
            'price' => $discountedPrice,       // Нова ціна (червона)
            'original_price' => $originalPrice // Стара ціна (перекреслена)
        ];
    }

    // Якщо нічого не знайшли (наприклад, ID невірні), повертаємо пустий масив
    echo json_encode($saleProducts);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}
?>