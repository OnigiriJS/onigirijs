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
header('Access-Control-Allow-Origin: *');

try {
    $locale = $_GET['locale'] ?? $_SESSION['locale'] ?? 'en';
    $_SESSION['locale'] = $locale;

    $menu = [
        [
            'id' => 1, 
            'nameKey' => 'menu.salmon.name',
            'descKey' => 'menu.salmon.desc',
            'price' => 3.50, 
            'emoji' => '🐟'
        ],
        [
            'id' => 2, 
            'nameKey' => 'menu.tuna.name',
            'descKey' => 'menu.tuna.desc',
            'price' => 3.50, 
            'emoji' => '🐠'
        ],
        [
            'id' => 3, 
            'nameKey' => 'menu.umeboshi.name',
            'descKey' => 'menu.umeboshi.desc',
            'price' => 3.00, 
            'emoji' => '🌸'
        ],
        [
            'id' => 4, 
            'nameKey' => 'menu.chicken.name',
            'descKey' => 'menu.chicken.desc',
            'price' => 4.00, 
            'emoji' => '🍗'
        ],
        [
            'id' => 5, 
            'nameKey' => 'menu.vegetable.name',
            'descKey' => 'menu.vegetable.desc',
            'price' => 3.25, 
            'emoji' => '🥬'
        ],
        [
            'id' => 6, 
            'nameKey' => 'menu.shrimp.name',
            'descKey' => 'menu.shrimp.desc',
            'price' => 4.50, 
            'emoji' => '🍤'
        ]
    ];

    echo json_encode([
        'menu' => $menu,
        'locale' => $locale,
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
