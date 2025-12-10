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
       ->orWhere('p.name LIKE :search4')
       ->orWhere('p.category = :cat')
       ->setParameter('search1', '%собак%')
       ->setParameter('search2', '%dog%')
       ->setParameter('search3', '%Pedigree%')
       ->setParameter('search4', '%Cesar%')
       ->setParameter('cat', 'dogs');

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