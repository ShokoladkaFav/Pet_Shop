<?php
require 'db.php';
try {
    $suppliers = $entityManager->getRepository(Supplier::class)->findAll();
    $result = array_map(function($s) {
        return [
            'supplier_id' => $s->supplier_id,
            'name' => $s->name,
            'contact_person' => $s->contact_person,
            'phone' => $s->phone,
            'email' => $s->email,
            'address' => $s->address
        ];
    }, $suppliers);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>