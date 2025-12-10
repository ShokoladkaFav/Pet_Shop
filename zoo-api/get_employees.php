<?php
require 'db.php';
try {
    $employees = $entityManager->getRepository(Employee::class)->findAll();
    $result = array_map(function($e) {
        return [
            'employee_id' => $e->employee_id,
            'first_name' => $e->first_name,
            'last_name' => $e->last_name,
            'work_email' => $e->work_email,
            'position' => $e->position
        ];
    }, $employees);
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>