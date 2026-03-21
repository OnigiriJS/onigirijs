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
 *   Website:   https://onigirijs.com/
 *   License:   BSD-3-Clause
 *
 *   Copyright (c) 2025 OnigiriJS Framework
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
     * Local Storage Manager
     */
    Onigiri.storage = {
        _prefix: 'onigiri_',
        _encrypted: false,

        setPrefix: function(prefix) {
            this._prefix = prefix;
            return this;
        },

        _getKey: function(key) {
            return this._prefix + key;
        },

        set: function(key, value, options) {
            options = options || {};
            const data = {
                value: value,
                timestamp: Date.now(),
                expires: options.expires || null
            };
            
            try {
                const storageKey = this._getKey(key);
                localStorage.setItem(storageKey, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('OnigiriJS Storage Error:', e);
                return false;
            }
        },

        get: function(key, defaultValue) {
            try {
                const storageKey = this._getKey(key);
                const item = localStorage.getItem(storageKey);
                if (!item) return defaultValue !== undefined ? defaultValue : null;
                
                const data = JSON.parse(item);
                
                if (data.expires && Date.now() > data.timestamp + data.expires) {
                    this.remove(key);
                    return defaultValue !== undefined ? defaultValue : null;
                }
                
                return data.value;
            } catch (e) {
                console.error('OnigiriJS Storage Error:', e);
                return defaultValue !== undefined ? defaultValue : null;
            }
        },

        remove: function(key) {
            try {
                const storageKey = this._getKey(key);
                localStorage.removeItem(storageKey);
                return true;
            } catch (e) {
                console.error('OnigiriJS Storage Error:', e);
                return false;
            }
        },

        clear: function() {
            try {
                const keys = this.keys();
                keys.forEach(key => this.remove(key));
                return true;
            } catch (e) {
                console.error('OnigiriJS Storage Error:', e);
                return false;
            }
        },

        has: function(key) {
            const storageKey = this._getKey(key);
            return localStorage.getItem(storageKey) !== null;
        },

        keys: function() {
            const allKeys = Object.keys(localStorage);
            return allKeys
                .filter(key => key.startsWith(this._prefix))
                .map(key => key.substring(this._prefix.length));
        },

        getAll: function(prefix) {
            const result = {};
            const keys = this.keys();
            
            keys.forEach(key => {
                if (!prefix || key.startsWith(prefix)) {
                    result[key] = this.get(key);
                }
            });
            
            return result;
        },

        size: function() {
            return this.keys().length;
        },

        session: {
            _prefix: 'onigiri_',

            setPrefix: function(prefix) {
                this._prefix = prefix;
                return this;
            },

            _getKey: function(key) {
                return this._prefix + key;
            },

            set: function(key, value) {
                try {
                    const storageKey = this._getKey(key);
                    sessionStorage.setItem(storageKey, JSON.stringify({ value: value }));
                    return true;
                } catch (e) {
                    console.error('OnigiriJS Session Storage Error:', e);
                    return false;
                }
            },

            get: function(key, defaultValue) {
                try {
                    const storageKey = this._getKey(key);
                    const item = sessionStorage.getItem(storageKey);
                    if (!item) return defaultValue !== undefined ? defaultValue : null;
                    return JSON.parse(item).value;
                } catch (e) {
                    console.error('OnigiriJS Session Storage Error:', e);
                    return defaultValue !== undefined ? defaultValue : null;
                }
            },

            remove: function(key) {
                try {
                    const storageKey = this._getKey(key);
                    sessionStorage.removeItem(storageKey);
                    return true;
                } catch (e) {
                    console.error('OnigiriJS Session Storage Error:', e);
                    return false;
                }
            },

            clear: function() {
                try {
                    const keys = this.keys();
                    keys.forEach(key => this.remove(key));
                    return true;
                } catch (e) {
                    console.error('OnigiriJS Session Storage Error:', e);
                    return false;
                }
            },

            keys: function() {
                const allKeys = Object.keys(sessionStorage);
                return allKeys
                    .filter(key => key.startsWith(this._prefix))
                    .map(key => key.substring(this._prefix.length));
            }
        }
    };

    Onigiri.modules.storage = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
