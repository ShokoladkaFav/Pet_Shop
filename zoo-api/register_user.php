<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username'], $data['email'], $data['password'])) {
    echo json_encode(["status" => "error", "message" => "Заповніть всі поля"]);
    exit;
}

try {
    $repo = $entityManager->getRepository(User::class);
    if ($repo->findOneBy(['email' => $data['email']])) {
        echo json_encode(["status" => "error", "message" => "Email вже використовується"]);
        exit;
    }

    $user = new User();
    $user->username = $data['username'];
    $user->email = $data['email'];
    $user->salt = bin2hex(random_bytes(16));
    $user->hash = hash('sha256', $data['password'] . $user->salt);
    $user->registration_date = new DateTime();

    $entityManager->persist($user);
    $entityManager->flush();

    echo json_encode(["status" => "success", "message" => "Реєстрація успішна"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>