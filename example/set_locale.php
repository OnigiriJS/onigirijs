<?php

session_start();

header('Content-Type: application/json');

function verifyCsrf() {
    $token = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf()) {
        http_response_code(403);
        echo json_encode(['error' => 'CSRF token mismatch']);
        exit;
    }

    $locale = filter_input(INPUT_POST, 'locale', FILTER_SANITIZE_STRING);

    $allowedLocales = ['en', 'es', 'fr', 'ja'];
    if (!in_array($locale, $allowedLocales)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid locale']);
        exit;
    }

    $_SESSION['locale'] = $locale;

    echo json_encode([
        'success' => true,
        'locale' => $locale
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
