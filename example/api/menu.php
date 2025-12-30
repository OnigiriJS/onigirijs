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

$menu = [
    ['id' => 1, 'name' => 'Salmon Onigiri', 'description' => 'Fresh salmon with seasoned rice', 'price' => 3.50, 'emoji' => '🐟'],
    ['id' => 2, 'name' => 'Tuna Onigiri', 'description' => 'Spicy tuna with mayo', 'price' => 3.50, 'emoji' => '🐠'],
    ['id' => 3, 'name' => 'Umeboshi Onigiri', 'description' => 'Pickled plum, classic taste', 'price' => 3.00, 'emoji' => '🌸'],
    ['id' => 4, 'name' => 'Chicken Teriyaki', 'description' => 'Grilled chicken with teriyaki sauce', 'price' => 4.00, 'emoji' => '🍗'],
    ['id' => 5, 'name' => 'Vegetable Onigiri', 'description' => 'Fresh vegetables and herbs', 'price' => 3.25, 'emoji' => '🥬'],
    ['id' => 6, 'name' => 'Shrimp Tempura', 'description' => 'Crispy tempura shrimp', 'price' => 4.50, 'emoji' => '🍤']
];

echo json_encode($menu);
