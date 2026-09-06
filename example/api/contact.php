<?php

/*
 * ===============================================================
 *      ____        _       _      _      _  _____ 
 *     / __ \      (_)     (_)    (_)    | |/ ____|
 *    | |  | |_ __  _  __ _ _ _ __ _     | | (___  
 *    | |  | | '_ \| |/ _` | | '__| |_   | |\___ \ 
 *    | |__| | | | | | (_| | | |  | | |__| |____) |
 *     \____/|_| |_|_|\__, |_|_|  |_|\____/|_____/ 
 *                     __/ |                       
 *                    |___/                        
 * ===============================================================
 *
 *   Lightweight, deliciously simple, modular JavaScript framework for building reactive HumHub modules with enterprise-grade security
 *
 *   Website:   https://onigirijs.greenmeteor.net/
 *   License:   BSD-3-Clause
 *
 *   Copyright (c) 2025 Green Meteor
 *
 *   Redistribution and use in source and binary forms, with or
 *   without modification, are permitted provided that the
 *   conditions of the BSD 3-Clause License are met.
 *
 *   SPDX-License-Identifier: BSD-3-Clause
 * ===============================================================
 */

// verifyCsrf() below reads $_SESSION['csrf_token'], so the session must be
// started first - without this the comparison is always against an empty
// value and every legitimate request gets rejected as a CSRF mismatch.
session_start();

header('Content-Type: application/json');

$locale = $_SESSION['locale'] ?? 'en';

$messages = [
    'en' => [
        'csrf_error' => 'CSRF token mismatch',
        'required_fields' => 'Required fields missing',
        'invalid_email' => 'Invalid email address',
        'method_not_allowed' => 'Method not allowed',
        'success' => 'Thank you for your message! 🍙'
    ],
    'es' => [
        'csrf_error' => 'Token CSRF no coincide',
        'required_fields' => 'Faltan campos obligatorios',
        'invalid_email' => 'Dirección de correo electrónico no válida',
        'method_not_allowed' => 'Método no permitido',
        'success' => '¡Gracias por tu mensaje! 🍙'
    ],
    'fr' => [
        'csrf_error' => 'Jeton CSRF incorrect',
        'required_fields' => 'Champs obligatoires manquants',
        'invalid_email' => 'Adresse e-mail invalide',
        'method_not_allowed' => 'Méthode non autorisée',
        'success' => 'Merci pour votre message! 🍙'
    ],
    'ja' => [
        'csrf_error' => 'CSRFトークンが一致しません',
        'required_fields' => '必須フィールドがありません',
        'invalid_email' => '無効なメールアドレス',
        'method_not_allowed' => 'メソッドは許可されていません',
        'success' => 'メッセージありがとうございます！🍙'
    ]
];

$msg = $messages[$locale] ?? $messages['en'];

function verifyCsrf() {
    $token = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return hash_equals($_SESSION['csrf_token'] ?? '', $token);
}

/**
 * FILTER_SANITIZE_STRING was deprecated in PHP 8.1 and removed in PHP 9.0.
 * This trims the value and HTML-encodes it, which is what that filter was
 * commonly (mis)used for. Note this only makes a value safe to echo back
 * into HTML - it does not replace proper output-context escaping wherever
 * this value is later rendered.
 */
function sanitizeInput(?string $value): string {
    return htmlspecialchars(trim($value ?? ''), ENT_QUOTES, 'UTF-8');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf()) {
        http_response_code(403);
        echo json_encode(['error' => $msg['csrf_error']]);
        exit;
    }

    $name = sanitizeInput($_POST['name'] ?? null);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = sanitizeInput($_POST['phone'] ?? null);
    $message = sanitizeInput($_POST['message'] ?? null);

    if (empty($name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => $msg['required_fields']]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => $msg['invalid_email']]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => $msg['success']
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => $msg['method_not_allowed']]);
}
