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
     * AJAX Helper with CSRF Support
     */
    Onigiri.ajax = function(options) {
        const defaults = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            data: null,
            csrf: true,
            timeout: 30000
        };

        const config = Onigiri.extend({}, defaults, options);

        // Add CSRF token if security module is loaded
        if (config.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
            config.headers = Onigiri.security.addCSRFToHeaders(config.headers);
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        return fetch(config.url, {
            method: config.method,
            headers: config.headers,
            body: config.data ? JSON.stringify(config.data) : null,
            signal: controller.signal
        }).then(response => {
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            }
            return response.text();
        }).catch(error => {
            clearTimeout(timeoutId);
            throw error;
        });
    };

    /**
     * Convenience methods
     */
    Onigiri.get = function(url, options) {
        return Onigiri.ajax(Onigiri.extend({ url: url, method: 'GET' }, options));
    };

    Onigiri.post = function(url, data, options) {
        return Onigiri.ajax(Onigiri.extend({ url: url, method: 'POST', data: data }, options));
    };

    Onigiri.put = function(url, data, options) {
        return Onigiri.ajax(Onigiri.extend({ url: url, method: 'PUT', data: data }, options));
    };

    Onigiri.delete = function(url, options) {
        return Onigiri.ajax(Onigiri.extend({ url: url, method: 'DELETE' }, options));
    };

    Onigiri.modules.ajax = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
