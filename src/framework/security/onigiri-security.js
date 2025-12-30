/*!
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
(function(Onigiri) {
    'use strict';

    if (!Onigiri) {
        throw new Error('OnigiriJS core not found. Load onigiri.core.js first.');
    }

    /**
     * Security Module - CSRF Protection and CSP Support
     */
    Onigiri.security = {
        _config: {
            csrfToken: null,
            csrfHeader: 'X-CSRF-Token',
            csrfParam: '_csrf',
            csrfMetaName: 'csrf-token',
            cspNonce: null,
            autoInjectCSRF: true
        },

        /**
         * Initialize security module
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});
            
            // Auto-detect CSRF token from meta tag
            if (!this._config.csrfToken) {
                const meta = document.querySelector(`meta[name="${this._config.csrfMetaName}"]`);
                if (meta) {
                    this._config.csrfToken = meta.getAttribute('content');
                }
            }

            // Auto-detect CSP nonce
            if (!this._config.cspNonce) {
                const scripts = document.querySelectorAll('script[nonce]');
                if (scripts.length > 0) {
                    this._config.cspNonce = scripts[0].getAttribute('nonce');
                }
            }

            // Auto-inject CSRF to forms
            if (this._config.autoInjectCSRF && this._config.csrfToken) {
                this._injectCSRFToForms();
            }

            return this;
        },

        /**
         * Get CSRF token
         */
        getToken: function() {
            return this._config.csrfToken;
        },

        /**
         * Set CSRF token
         */
        setToken: function(token) {
            this._config.csrfToken = token;
            
            // Update meta tag
            let meta = document.querySelector(`meta[name="${this._config.csrfMetaName}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', this._config.csrfMetaName);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', token);
            
            return this;
        },

        /**
         * Get CSP nonce
         */
        getNonce: function() {
            return this._config.cspNonce;
        },

        /**
         * Set CSP nonce
         */
        setNonce: function(nonce) {
            this._config.cspNonce = nonce;
            return this;
        },

        /**
         * Add CSRF token to headers object
         */
        addCSRFToHeaders: function(headers) {
            headers = headers || {};
            if (this._config.csrfToken) {
                headers[this._config.csrfHeader] = this._config.csrfToken;
            }
            return headers;
        },

        /**
         * Add CSRF token to form data
         */
        addCSRFToData: function(data) {
            if (this._config.csrfToken) {
                if (data instanceof FormData) {
                    data.append(this._config.csrfParam, this._config.csrfToken);
                } else if (typeof data === 'object') {
                    data[this._config.csrfParam] = this._config.csrfToken;
                }
            }
            return data;
        },

        /**
         * Inject CSRF token to all forms
         */
        _injectCSRFToForms: function() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => this.addCSRFToForm(form));
        },

        /**
         * Add CSRF token to a specific form
         */
        addCSRFToForm: function(form) {
            if (!this._config.csrfToken) return;
            
            // Check if token already exists
            let input = form.querySelector(`input[name="${this._config.csrfParam}"]`);
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = this._config.csrfParam;
                form.appendChild(input);
            }
            input.value = this._config.csrfToken;
        },

        /**
         * Create script element with CSP nonce
         */
        createScript: function(src, onload) {
            const script = document.createElement('script');
            script.src = src;
            
            if (this._config.cspNonce) {
                script.setAttribute('nonce', this._config.cspNonce);
            }
            
            if (onload) {
                script.onload = onload;
            }
            
            return script;
        },

        /**
         * Create style element with CSP nonce
         */
        createStyle: function(content) {
            const style = document.createElement('style');
            
            if (this._config.cspNonce) {
                style.setAttribute('nonce', this._config.cspNonce);
            }
            
            style.textContent = content;
            return style;
        },

        /**
         * Execute inline script with CSP nonce
         */
        executeScript: function(code) {
            const script = document.createElement('script');
            
            if (this._config.cspNonce) {
                script.setAttribute('nonce', this._config.cspNonce);
            }
            
            script.textContent = code;
            document.head.appendChild(script);
            document.head.removeChild(script);
        },

        /**
         * Sanitize HTML to prevent XSS
         */
        sanitizeHTML: function(html) {
            const div = document.createElement('div');
            div.textContent = html;
            return div.innerHTML;
        },

        /**
         * Escape HTML entities
         */
        escapeHTML: function(str) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        },

        /**
         * Validate URL to prevent open redirects
         */
        isValidURL: function(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                return parsed.protocol === 'http:' || parsed.protocol === 'https:';
            } catch (e) {
                return false;
            }
        },

        /**
         * Check if URL is same origin
         */
        isSameOrigin: function(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                return parsed.origin === window.location.origin;
            } catch (e) {
                return false;
            }
        }
    };

    Onigiri.modules.security = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
