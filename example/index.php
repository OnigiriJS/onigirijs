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

session_start();

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function csrf_token() {
    return $_SESSION['csrf_token'];
}

$locale = $_SESSION['locale'] ?? 'en';
?>
<!DOCTYPE html>
<html lang="<?= $locale ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= csrf_token() ?>">
    <title data-i18n="page.title">🍙 Onigiri Shop - OnigiriJS Demo</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍙</text></svg>">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍙</text></svg>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <link rel="stylesheet" href="static/css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1 data-i18n="header.title">🍙 Onigiri Shop Demo</h1>
            <p data-i18n="header.subtitle">A complete demonstration of OnigiriJS features</p>

            <div class="language-switcher">
                <select id="language-select">
                    <option value="en" <?= $locale === 'en' ? 'selected' : '' ?>>English (USD)</option>
                    <option value="es" <?= $locale === 'es' ? 'selected' : '' ?>>Español (EUR)</option>
                    <option value="fr" <?= $locale === 'fr' ? 'selected' : '' ?>>Français (EUR)</option>
                    <option value="ja" <?= $locale === 'ja' ? 'selected' : '' ?>>日本語 (JPY)</option>
                </select>
            </div>
        </header>

        <nav class="demo-nav">
            <button class="tab-btn active" data-tab="shop" data-i18n="nav.shop">Shop</button>
            <button class="tab-btn" data-tab="form" data-i18n="nav.contact">Contact Form</button>
            <button class="tab-btn" data-tab="components" data-i18n="nav.components">Components</button>
            <button class="tab-btn" data-tab="features" data-i18n="nav.features">Features</button>
        </nav>

        <div id="shop-section" class="demo-section active">
            <h2 data-i18n="shop.title">🍙 Onigiri Shop (Full-Featured Demo)</h2>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div>
                    <div id="menu-container" class="menu-grid">
                        <div class="loading" data-i18n="shop.loading">Loading menu... 🍙</div>
                    </div>
                </div>

                <div>
                    <div class="cart-panel">
                        <h3 data-i18n="cart.title">🛒 Your Cart</h3>
                        <div id="cart-items"></div>
                        <div class="cart-total">
                            <span data-i18n="cart.total">Total:</span> <span id="cart-total">$0.00</span>
                        </div>
                        <button class="btn" id="checkout-btn" disabled data-i18n="cart.checkout">Checkout</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="form-section" class="demo-section">
            <h2 data-i18n="form.title">📝 Contact Form (Validation Demo)</h2>

            <form id="contact-form">
                <div class="form-group">
                    <label for="name" data-i18n="form.name">Name *</label>
                    <input type="text" id="name" name="name" data-i18n-placeholder="form.namePlaceholder">
                    <div class="error-message" id="name-error"></div>
                </div>

                <div class="form-group">
                    <label for="email" data-i18n="form.email">Email *</label>
                    <input type="email" id="email" name="email" data-i18n-placeholder="form.emailPlaceholder">
                    <div class="error-message" id="email-error"></div>
                </div>

                <div class="form-group">
                    <label for="phone" data-i18n="form.phone">Phone (123-456-7890)</label>
                    <input type="tel" id="phone" name="phone" data-i18n-placeholder="form.phonePlaceholder">
                    <div class="error-message" id="phone-error"></div>
                </div>

                <div class="form-group">
                    <label for="message" data-i18n="form.message">Message *</label>
                    <textarea id="message" name="message" rows="5" data-i18n-placeholder="form.messagePlaceholder"></textarea>
                    <div class="error-message" id="message-error"></div>
                </div>

                <button type="submit" class="btn" data-i18n="form.submit">Send Message 🍙</button>
            </form>
        </div>

        <div id="components-section" class="demo-section">
            <h2 data-i18n="components.title">📦 Reactive Components Demo</h2>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="counter-value">0</div>
                    <div class="stat-label" data-i18n="components.clickCounter">Click Counter</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="storage-items">0</div>
                    <div class="stat-label" data-i18n="components.storedItems">Stored Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="events-fired">0</div>
                    <div class="stat-label" data-i18n="components.eventsFired">Events Fired</div>
                </div>
            </div>

            <button class="btn" id="increment-btn" data-i18n="components.increment">Increment Counter 🍙</button>
        </div>

        <div id="features-section" class="demo-section">
            <h2 data-i18n="features.title">✨ Feature Demonstrations</h2>

            <div class="accordion-header">
                🎨 Advanced Animation System
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">OnigiriJS includes a comprehensive animation library with 25+ easing functions and multiple animation types.</p>
                <div id="animation-box" style="width: 100%; height: 100px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">Animation Box</div>
                <button class="btn" onclick="demoAnimations()">Run Animation Sequence 🎬</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Includes:</strong> fadeIn/Out, slideDown/Up, scale, rotate, shake, pulse, bounce, and custom animations with elastic, back, and bounce easings!
                </div>
            </div>

            <div class="accordion-header">
                💾 Local Storage & State Management
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Persistent client-side storage with automatic JSON serialization and namespace support.</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Storage Prefix:</strong>
                        <div id="storage-prefix" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">onigiri_</div>
                    </div>
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Stored Items:</strong>
                        <div id="storage-count" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">0</div>
                    </div>
                </div>
                <button class="btn" onclick="demoStorage()">Test Storage Operations 💿</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Features:</strong> Automatic serialization, prefix namespacing, get/set/remove/clear operations, and key enumeration.
                </div>
            </div>

            <div class="accordion-header">
                🔒 Built-in Security Features
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">CSRF protection, XSS prevention, and secure form handling out of the box.</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>CSRF Token:</strong>
                        <div id="csrf-token" style="font-size: 0.9rem; color: #ff6b6b; margin-top: 0.5rem; word-break: break-all;">Loading...</div>
                    </div>
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Security Status:</strong>
                        <div id="security-status" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">No</div>
                    </div>
                </div>
                <button class="btn" onclick="demoSecurity()">Test Security Features 🛡️</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Includes:</strong> Automatic CSRF token injection, XSS sanitization, and secure AJAX request handling.
                </div>
            </div>

            <div class="accordion-header">
                ⚡ Advanced Event System
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Powerful event delegation, custom events, and event bus for component communication.</p>
                <div style="margin-bottom: 1rem;">
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px; margin-bottom: 0.5rem;">
                        <strong>Events Triggered:</strong>
                        <div id="event-count" style="font-size: 1.5rem; color: #ff6b6b; margin-top: 0.5rem;">0</div>
                    </div>
                </div>
                <button class="btn" onclick="demoEvents()">Trigger Custom Event 🎯</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Features:</strong> Event delegation, custom events, event bubbling, one-time listeners, and event namespacing.
                </div>
            </div>

            <div class="accordion-header">
                🧩 Reactive Component System
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Build reactive UIs with automatic state management and computed properties.</p>
                <div style="padding: 1rem; background: #fff5e6; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>Component Value:</strong>
                    <div id="demo-component-value" style="font-size: 2rem; color: #ff6b6b; margin: 1rem 0; text-align: center;">0</div>
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button class="btn" onclick="demoComponent('increment')" style="width: auto; padding: 0.5rem 1rem;">Increment ➕</button>
                        <button class="btn" onclick="demoComponent('decrement')" style="width: auto; padding: 0.5rem 1rem;">Decrement ➖</button>
                        <button class="btn" onclick="demoComponent('reset')" style="width: auto; padding: 0.5rem 1rem;">Reset 🔄</button>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Features:</strong> Reactive data binding, computed properties, lifecycle hooks (created, mounted, updated), and automatic DOM updates.
                </div>
            </div>

            <div class="accordion-header">
                🌍 Internationalization (i18n)
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Multi-language support with automatic translation, currency formatting, and locale-aware operations.</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Current Locale:</strong>
                        <div id="current-locale" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">en</div>
                    </div>
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Available Locales:</strong>
                        <div id="available-locales" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">4</div>
                    </div>
                </div>
                <div style="padding: 1rem; background: #fff5e6; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>Translation Example:</strong>
                    <div id="translation-demo" style="font-size: 1.1rem; margin-top: 0.5rem; font-style: italic;">Hello, World!</div>
                </div>
                <button class="btn" onclick="demoI18n()">Cycle Through Languages 🌐</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Includes:</strong> Automatic page translation, currency formatting (USD, EUR, JPY), date/time formatting, and pluralization support.
                </div>
            </div>

            <div class="accordion-header">
                🌐 AJAX & HTTP Requests
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Simplified HTTP requests with automatic CSRF token injection and JSON handling.</p>
                <div style="padding: 1rem; background: #fff5e6; border-radius: 8px; margin-bottom: 1rem;">
                    <strong>Request Status:</strong>
                    <div id="ajax-status" style="font-size: 1.2rem; color: #ff6b6b; margin-top: 0.5rem;">Ready</div>
                </div>
                <button class="btn" onclick="demoAjax()">Test AJAX Request 📡</button>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Features:</strong> GET/POST/PUT/DELETE methods, automatic JSON parsing, promise-based API, and built-in error handling.
                </div>
            </div>

            <div class="accordion-header">
                🛠️ Utility Functions
            </div>
            <div class="accordion-content">
                <p style="margin-bottom: 1rem;">Collection of helpful utility functions for common operations.</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Debounce Test:</strong>
                        <div id="debounce-count" style="font-size: 1.5rem; color: #ff6b6b; margin-top: 0.5rem;">0</div>
                    </div>
                    <div style="padding: 1rem; background: #fff5e6; border-radius: 8px;">
                        <strong>Throttle Test:</strong>
                        <div id="throttle-count" style="font-size: 1.5rem; color: #ff6b6b; margin-top: 0.5rem;">0</div>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn" onclick="demoDebounce()" style="flex: 1;">Test Debounce ⏱️</button>
                    <button class="btn" onclick="demoThrottle()" style="flex: 1;">Test Throttle ⚡</button>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff5e6; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Includes:</strong> debounce, throttle, deep clone, type checking (isArray, isObject, isFunction), and isEmpty utilities.
                </div>
            </div>
        </div>
    </div>

    <div id="notification" class="notification"></div>

    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/core/onigiri-core.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/events/onigiri-events.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/components/onigiri-components.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/security/onigiri-security.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/ajax/onigiri-ajax.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/storage/onigiri-storage.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/validation/onigiri-validation.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/animate/onigiri-animate.js"></script>

    <script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/translation/onigiri-translation.js"></script>

    <script src="static/js/translations.js"></script>

    <script src="static/js/demo.js"></script>
</body>
</html>
