<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email'], $data['password'])) {
    echo json_encode(["status" => "error", "message" => "Введіть email та пароль"]);
    exit;
}

try {
    $userRepo = $entityManager->getRepository(User::class);
    $user = $userRepo->findOneBy(['email' => $data['email']]);

    if ($user) {
        $checkHash = hash('sha256', $data['password'] . $user->salt);
        if ($checkHash === $user->hash) {
            echo json_encode([
                "status" => "success",
                "user" => [
                    "user_id" => $user->user_id,
                    "username" => $user->username,
                    "email" => $user->email,
                    "address" => $user->address,
                    "phone" => $user->phone
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Невірний пароль"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Користувача не знайдено"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "System error"]);
}
?>