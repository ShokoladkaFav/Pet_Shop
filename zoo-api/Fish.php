<?php
require 'db.php';

try {
    $qb = $entityManager->createQueryBuilder();

    $qb->select('p')
       ->from(Product::class, 'p')
       ->where('p.name LIKE :search1')
       ->orWhere('p.description LIKE :search1')
       ->orWhere('p.name LIKE :search2')
       ->orWhere('p.name LIKE :search3')
       ->orWhere('p.category = :cat1')
       ->orWhere('p.category = :cat2')
       ->setParameter('search1', '%риб%')
       ->setParameter('search2', '%акваріум%')
       ->setParameter('search3', '%fish%')
       ->setParameter('cat1', 'fish')
       ->setParameter('cat2', 'Обладнання');

    $products = $qb->getQuery()->getResult();

    $result = array_map(function($p) {
        return [
            'product_id' => $p->product_id,
            'name' => $p->name,
            'price' => $p->price,
            'description' => $p->description,
            'image_url' => $p->image_url
        ];
    }, $products);

    echo json_encode($result);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>