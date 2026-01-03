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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrf()) {
        http_response_code(403);
        echo json_encode(['error' => $msg['csrf_error']]);
        exit;
    }

    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

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
