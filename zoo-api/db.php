<?php
// Дозволяємо запити з будь-якого джерела (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

use Doctrine\DBAL\DriverManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\ORMSetup;

// Перевірка наявності автозавантажувача
if (!file_exists(__DIR__ . "/vendor/autoload.php")) {
    http_response_code(500);
    echo json_encode(["error" => "Run 'composer install' inside zoo-api folder!"]);
    exit;
}

require_once __DIR__ . "/vendor/autoload.php";

// Налаштування Doctrine
$config = ORMSetup::createAttributeMetadataConfiguration(
    paths: [__DIR__ . '/entities'],
    isDevMode: true,
);

// Параметри бази даних
$connectionParams = [
    'driver'   => 'pdo_mysql',
    'host'     => 'localhost',
    'dbname'   => 'pet_shop',
    'user'     => 'root',
    'password' => '', // Вставте свій пароль, якщо є
    'charset'  => 'utf8mb4',
];

try {
    $connection = DriverManager::getConnection($connectionParams, $config);
    $entityManager = new EntityManager($connection, $config);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
?>