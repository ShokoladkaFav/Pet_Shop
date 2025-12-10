<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Обробка preflight запитів
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "pet_shop");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Помилка з'єднання з БД"]));
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['work_email']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Введіть робочий Email та пароль"]);
    exit();
}

$work_email = $conn->real_escape_string(trim($data['work_email']));
$password = trim($data['password']);

// 1. Шукаємо працівника за work_email
$sql = "SELECT * FROM employee WHERE work_email = '$work_email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $employee = $result->fetch_assoc();
    
    // 2. Отримуємо сіль та хеш з бази
    $salt = $employee['salt'];
    $stored_hash = $employee['hash'];
    
    // 3. Генеруємо хеш введеного пароля з сіллю (SHA256)
    // Важливо: переконайтеся, що при реєстрації/створенні ви використовували такий самий метод: hash('sha256', $password . $salt)
    $check_hash = hash('sha256', $password . $salt);
    
    if ($check_hash === $stored_hash) {
        // Успіх! Видаляємо секретні дані перед відправкою
        unset($employee['hash']);
        unset($employee['salt']);
        
        echo json_encode([
            "status" => "success",
            "message" => "Вхід успішний",
            "employee" => $employee,
            "token" => bin2hex(random_bytes(16)) // Імітація токена
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Невірний пароль"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Співробітника з таким Email не знайдено"]);
}

$conn->close();
?>