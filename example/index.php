<?php

session_start();

// Generate CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

function csrf_token() {
    return $_SESSION['csrf_token'];
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= csrf_token() ?>">
    <title>🍙 Onigiri Shop - OnigiriJS Demo</title>
    <link rel="stylesheet" href="static/css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🍙 Onigiri Shop Demo</h1>
            <p>A complete demonstration of OnigiriJS features</p>
        </header>

        <nav class="demo-nav">
            <button class="tab-btn active" data-tab="shop">Shop</button>
            <button class="tab-btn" data-tab="form">Contact Form</button>
            <button class="tab-btn" data-tab="components">Components</button>
            <button class="tab-btn" data-tab="features">Features</button>
        </nav>

        <div id="shop-section" class="demo-section active">
            <h2>🍙 Onigiri Shop (Full-Featured Demo)</h2>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div>
                    <div id="menu-container" class="menu-grid">
                        <div class="loading">Loading menu... 🍙</div>
                    </div>
                </div>

                <div>
                    <div class="cart-panel">
                        <h3>🛒 Your Cart</h3>
                        <div id="cart-items"></div>
                        <div class="cart-total">
                            Total: $<span id="cart-total">0.00</span>
                        </div>
                        <button class="btn" id="checkout-btn" disabled>Checkout</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="form-section" class="demo-section">
            <h2>📝 Contact Form (Validation Demo)</h2>
            
            <form id="contact-form">
                <div class="form-group">
                    <label for="name">Name *</label>
                    <input type="text" id="name" name="name">
                    <div class="error-message" id="name-error"></div>
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email">
                    <div class="error-message" id="email-error"></div>
                </div>

                <div class="form-group">
                    <label for="phone">Phone (123-456-7890)</label>
                    <input type="tel" id="phone" name="phone">
                    <div class="error-message" id="phone-error"></div>
                </div>

                <div class="form-group">
                    <label for="message">Message *</label>
                    <textarea id="message" name="message" rows="5"></textarea>
                    <div class="error-message" id="message-error"></div>
                </div>

                <button type="submit" class="btn">Send Message 🍙</button>
            </form>
        </div>

        <div id="components-section" class="demo-section">
            <h2>📦 Reactive Components Demo</h2>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="counter-value">0</div>
                    <div class="stat-label">Click Counter</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="storage-items">0</div>
                    <div class="stat-label">Stored Items</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="events-fired">0</div>
                    <div class="stat-label">Events Fired</div>
                </div>
            </div>

            <button class="btn" id="increment-btn">Increment Counter 🍙</button>
        </div>

        <div id="features-section" class="demo-section">
            <h2>✨ Feature Demonstrations</h2>

            <div class="accordion-header">
                🎨 Animation Demo
            </div>
            <div class="accordion-content">
                <div id="animation-box" style="width: 100%; height: 100px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 8px; margin-bottom: 1rem;"></div>
                <button class="btn" onclick="demoAnimations()">Run Animations</button>
            </div>

            <div class="accordion-header">
                💾 Local Storage Demo
            </div>
            <div class="accordion-content">
                <p>Current storage prefix: <strong id="storage-prefix">onigiri_</strong></p>
                <p>Stored items: <strong id="storage-count">0</strong></p>
                <button class="btn" onclick="demoStorage()">Test Storage</button>
            </div>

            <div class="accordion-header">
                🔒 Security Demo
            </div>
            <div class="accordion-content">
                <p>CSRF Token: <strong id="csrf-token">Loading...</strong></p>
                <p>Security initialized: <strong id="security-status">No</strong></p>
                <button class="btn" onclick="demoSecurity()">Test Security</button>
            </div>
        </div>
    </div>

    <div id="notification" class="notification"></div>

    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/core/onigiri-core.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/events/onigiri-events.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/components/onigiri-components.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/security/onigiri-security.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/ajax/onigiri.ajax.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/storage/onigiri-storage.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/validation/onigiri.validation.js"></script>
    <script src="https://github.com/OnigiriJS/onigirijs/blob/main/src/framework/animate/onigiri.animate.js"></script>

    <script src="static/js/demo.js"></script>
</body>
</html>
