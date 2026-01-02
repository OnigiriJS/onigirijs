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
     * Plugin Registry
     */
    Onigiri.pluginRegistry = {
        _plugins: {},
        _installed: new Set(),

        register: function(name, plugin) {
            if (this._plugins[name]) {
                console.warn(`OnigiriJS: Plugin "${name}" already registered`);
                return false;
            }

            this._plugins[name] = plugin;
            return true;
        },

        get: function(name) {
            return this._plugins[name] || null;
        },

        has: function(name) {
            return !!this._plugins[name];
        },

        isInstalled: function(name) {
            return this._installed.has(name);
        },

        markInstalled: function(name) {
            this._installed.add(name);
        },

        list: function() {
            return Object.keys(this._plugins);
        }
    };

    /**
     * Enhanced plugin installation
     */
    const originalUse = Onigiri.use;
    Onigiri.use = function(plugin, options) {
        let pluginName = null;
        let pluginObj = null;

        if (typeof plugin === 'string') {
            pluginName = plugin;
            pluginObj = Onigiri.pluginRegistry.get(plugin);

            if (!pluginObj) {
                console.error(`OnigiriJS: Plugin "${plugin}" not found`);
                return Onigiri;
            }
        } else {
            pluginObj = plugin;
            pluginName = plugin.name || 'anonymous';
        }

        if (Onigiri.pluginRegistry.isInstalled(pluginName)) {
            console.warn(`OnigiriJS: Plugin "${pluginName}" already installed`);
            return Onigiri;
        }

        if (typeof pluginObj === 'function') {
            pluginObj(Onigiri, options);
        } else if (pluginObj && typeof pluginObj.install === 'function') {
            pluginObj.install(Onigiri, options);
        }

        Onigiri.pluginRegistry.markInstalled(pluginName);

        return Onigiri;
    };

    /**
     * PLUGIN: Storage
     * LocalStorage/SessionStorage wrapper with JSON support
     */
    const StoragePlugin = {
        name: 'storage',
        version: '1.0.0',

        install: function(Onigiri, options) {
            const defaults = {
                type: 'local', // 'local' or 'session'
                prefix: 'onigiri_',
                serialize: true
            };

            const config = Onigiri.extend({}, defaults, options);
            const storage = config.type === 'session' ? sessionStorage : localStorage;

            Onigiri.storage = {
                set: function(key, value) {
                    try {
                        const prefixedKey = config.prefix + key;
                        const data = config.serialize ? JSON.stringify(value) : value;
                        storage.setItem(prefixedKey, data);
                        return true;
                    } catch (e) {
                        console.error('OnigiriJS Storage Error:', e);
                        return false;
                    }
                },

                get: function(key, defaultValue = null) {
                    try {
                        const prefixedKey = config.prefix + key;
                        const data = storage.getItem(prefixedKey);

                        if (data === null) return defaultValue;

                        return config.serialize ? JSON.parse(data) : data;
                    } catch (e) {
                        console.error('OnigiriJS Storage Error:', e);
                        return defaultValue;
                    }
                },

                remove: function(key) {
                    const prefixedKey = config.prefix + key;
                    storage.removeItem(prefixedKey);
                    return this;
                },

                clear: function() {
                    const keys = Object.keys(storage);
                    keys.forEach(key => {
                        if (key.startsWith(config.prefix)) {
                            storage.removeItem(key);
                        }
                    });
                    return this;
                },

                has: function(key) {
                    const prefixedKey = config.prefix + key;
                    return storage.getItem(prefixedKey) !== null;
                },

                keys: function() {
                    const keys = [];
                    for (let i = 0; i < storage.length; i++) {
                        const key = storage.key(i);
                        if (key.startsWith(config.prefix)) {
                            keys.push(key.replace(config.prefix, ''));
                        }
                    }
                    return keys;
                }
            };

            Onigiri.modules.storage = true;
        }
    };

    /**
     * PLUGIN: Router
     * Simple hash-based routing
     */
    const RouterPlugin = {
        name: 'router',
        version: '1.0.0',

        install: function(Onigiri, options) {
            const defaults = {
                mode: 'hash', // 'hash' or 'history'
                root: '/'
            };

            const config = Onigiri.extend({}, defaults, options);

            Onigiri.router = {
                routes: {},
                currentRoute: null,

                add: function(path, handler) {
                    this.routes[path] = handler;
                    return this;
                },

                remove: function(path) {
                    delete this.routes[path];
                    return this;
                },

                navigate: function(path) {
                    if (config.mode === 'hash') {
                        window.location.hash = path;
                    } else {
                        history.pushState(null, null, config.root + path);
                        this._resolve();
                    }
                    return this;
                },

                _resolve: function() {
                    let path = config.mode === 'hash' 
                        ? window.location.hash.slice(1) || '/'
                        : window.location.pathname.replace(config.root, '') || '/';

                    if (path !== '/' && path.endsWith('/')) {
                        path = path.slice(0, -1);
                    }

                    this.currentRoute = path;

                    if (this.routes[path]) {
                        this.routes[path](path, {});
                        return;
                    }

                    for (let route in this.routes) {
                        const params = this._match(route, path);
                        if (params) {
                            this.routes[route](path, params);
                            return;
                        }
                    }

                    if (this.routes['*']) {
                        this.routes['*'](path, {});
                    }
                },

                _match: function(route, path) {
                    const routeParts = route.split('/');
                    const pathParts = path.split('/');

                    if (routeParts.length !== pathParts.length) {
                        return null;
                    }

                    const params = {};

                    for (let i = 0; i < routeParts.length; i++) {
                        if (routeParts[i].startsWith(':')) {
                            const paramName = routeParts[i].slice(1);
                            params[paramName] = pathParts[i];
                        } else if (routeParts[i] !== pathParts[i]) {
                            return null;
                        }
                    }

                    return params;
                },

                start: function() {
                    if (config.mode === 'hash') {
                        window.addEventListener('hashchange', () => this._resolve());
                    } else {
                        window.addEventListener('popstate', () => this._resolve());

                        document.addEventListener('click', (e) => {
                            if (e.target.tagName === 'A' && e.target.hasAttribute('data-route')) {
                                e.preventDefault();
                                const path = e.target.getAttribute('href');
                                this.navigate(path);
                            }
                        });
                    }

                    this._resolve();
                    return this;
                }
            };

            Onigiri.modules.router = true;
        }
    };

    /**
     * PLUGIN: Animation
     * CSS animation helpers
     */
    const AnimationPlugin = {
        name: 'animation',
        version: '1.0.0',

        install: function(Onigiri) {
            Onigiri.prototype.fadeIn = function(duration = 300, callback) {
                this.each(el => {
                    el.style.opacity = '0';
                    el.style.display = '';
                    el.style.transition = `opacity ${duration}ms`;

                    setTimeout(() => {
                        el.style.opacity = '1';
                    }, 10);

                    setTimeout(() => {
                        el.style.transition = '';
                        if (callback) callback.call(el);
                    }, duration);
                });
                return this;
            };

            Onigiri.prototype.fadeOut = function(duration = 300, callback) {
                this.each(el => {
                    el.style.transition = `opacity ${duration}ms`;
                    el.style.opacity = '0';

                    setTimeout(() => {
                        el.style.display = 'none';
                        el.style.transition = '';
                        if (callback) callback.call(el);
                    }, duration);
                });
                return this;
            };

            Onigiri.prototype.slideDown = function(duration = 300, callback) {
                this.each(el => {
                    el.style.display = '';
                    const height = el.scrollHeight;
                    el.style.height = '0';
                    el.style.overflow = 'hidden';
                    el.style.transition = `height ${duration}ms`;

                    setTimeout(() => {
                        el.style.height = height + 'px';
                    }, 10);

                    setTimeout(() => {
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.transition = '';
                        if (callback) callback.call(el);
                    }, duration);
                });
                return this;
            };

            Onigiri.prototype.slideUp = function(duration = 300, callback) {
                this.each(el => {
                    const height = el.scrollHeight;
                    el.style.height = height + 'px';
                    el.style.overflow = 'hidden';
                    el.style.transition = `height ${duration}ms`;

                    setTimeout(() => {
                        el.style.height = '0';
                    }, 10);

                    setTimeout(() => {
                        el.style.display = 'none';
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.transition = '';
                        if (callback) callback.call(el);
                    }, duration);
                });
                return this;
            };

            Onigiri.prototype.animate = function(properties, duration = 300, callback) {
                this.each(el => {
                    const transitions = [];

                    Object.keys(properties).forEach(prop => {
                        transitions.push(`${prop} ${duration}ms`);
                    });

                    el.style.transition = transitions.join(', ');

                    setTimeout(() => {
                        Object.keys(properties).forEach(prop => {
                            el.style[prop] = properties[prop];
                        });
                    }, 10);

                    setTimeout(() => {
                        el.style.transition = '';
                        if (callback) callback.call(el);
                    }, duration);
                });
                return this;
            };

            Onigiri.modules.animation = true;
        }
    };

    /**
     * PLUGIN: Security
     * CSRF token management
     */
    const SecurityPlugin = {
        name: 'security',
        version: '1.0.0',

        install: function(Onigiri, options) {
            const defaults = {
                tokenName: 'csrf_token',
                headerName: 'X-CSRF-Token',
                metaName: 'csrf-token'
            };

            const config = Onigiri.extend({}, defaults, options);

            Onigiri.security = {
                getToken: function() {
                    const meta = document.querySelector(`meta[name="${config.metaName}"]`);
                    return meta ? meta.getAttribute('content') : null;
                },

                setToken: function(token) {
                    let meta = document.querySelector(`meta[name="${config.metaName}"]`);
                    if (!meta) {
                        meta = document.createElement('meta');
                        meta.setAttribute('name', config.metaName);
                        document.head.appendChild(meta);
                    }
                    meta.setAttribute('content', token);
                    return this;
                },

                addCSRFToHeaders: function(headers = {}) {
                    const token = this.getToken();
                    if (token) {
                        headers[config.headerName] = token;
                    }
                    return headers;
                },

                addCSRFToForm: function(form) {
                    const token = this.getToken();
                    if (!token) return this;

                    let input = form.querySelector(`input[name="${config.tokenName}"]`);
                    if (!input) {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = config.tokenName;
                        form.appendChild(input);
                    }
                    input.value = token;
                    return this;
                }
            };

            document.addEventListener('submit', (e) => {
                if (e.target.tagName === 'FORM' && !e.target.hasAttribute('data-no-csrf')) {
                    Onigiri.security.addCSRFToForm(e.target);
                }
            });

            Onigiri.modules.security = true;
        }
    };

    /**
     * PLUGIN: Cookies
     * Cookie management
     */
    const CookiesPlugin = {
        name: 'cookies',
        version: '1.0.0',

        install: function(Onigiri) {
            Onigiri.cookies = {
                set: function(name, value, options = {}) {
                    const defaults = {
                        path: '/',
                        expires: null, // days
                        secure: false,
                        sameSite: 'Lax'
                    };

                    const config = Onigiri.extend({}, defaults, options);
                    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

                    if (config.expires) {
                        const date = new Date();
                        date.setTime(date.getTime() + (config.expires * 24 * 60 * 60 * 1000));
                        cookieString += `; expires=${date.toUTCString()}`;
                    }

                    cookieString += `; path=${config.path}`;

                    if (config.domain) {
                        cookieString += `; domain=${config.domain}`;
                    }

                    if (config.secure) {
                        cookieString += '; secure';
                    }

                    cookieString += `; SameSite=${config.sameSite}`;

                    document.cookie = cookieString;
                    return this;
                },

                get: function(name) {
                    const nameEQ = encodeURIComponent(name) + '=';
                    const cookies = document.cookie.split(';');

                    for (let i = 0; i < cookies.length; i++) {
                        let cookie = cookies[i].trim();
                        if (cookie.indexOf(nameEQ) === 0) {
                            return decodeURIComponent(cookie.substring(nameEQ.length));
                        }
                    }
                    return null;
                },

                remove: function(name, options = {}) {
                    this.set(name, '', Onigiri.extend({}, options, { expires: -1 }));
                    return this;
                },

                has: function(name) {
                    return this.get(name) !== null;
                }
            };

            Onigiri.modules.cookies = true;
        }
    };

    Onigiri.pluginRegistry.register('storage', StoragePlugin);
    Onigiri.pluginRegistry.register('router', RouterPlugin);
    Onigiri.pluginRegistry.register('animation', AnimationPlugin);
    Onigiri.pluginRegistry.register('security', SecurityPlugin);
    Onigiri.pluginRegistry.register('cookies', CookiesPlugin);

    Onigiri.modules.plugins = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
