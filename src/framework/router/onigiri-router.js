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
     * Router System - Lightweight routing with PJAX support
     */
    Onigiri.router = {
        _config: {
            mode: 'history', // 'history' or 'hash'
            root: '/',
            container: '#main',
            linkSelector: 'a[data-route]',
            formSelector: 'form[data-route]',
            pjax: true,
            pjaxTimeout: 5000,
            scrollToTop: true,
            scrollBehavior: 'smooth',
            updateTitle: true,
            csrf: true,
            cachePages: true,
            maxCache: 20,
            prefetch: false,
            prefetchDelay: 100,
            loadingClass: 'route-loading',
            transitionDuration: 300
        },

        _routes: [],
        _currentRoute: null,
        _cache: new Map(),
        _beforeHooks: [],
        _afterHooks: [],
        _errorHooks: [],
        _initialized: false,

        /**
         * Initialize router
         */
        init: function(options) {
            if (this._initialized) {
                console.warn('OnigiriJS Router already initialized');
                return this;
            }

            Onigiri.extend(this._config, options || {});

            this._setupEventListeners();
            this._handleInitialRoute();
            this._initialized = true;

            document.dispatchEvent(new CustomEvent('onigiri:router:ready'));

            return this;
        },

        /**
         * Register a route
         */
        route: function(path, handler, options) {
            if (typeof path === 'object') {
                Object.keys(path).forEach(p => {
                    this.route(p, path[p], handler);
                });
                return this;
            }

            options = Onigiri.extend({
                name: null,
                cache: this._config.cachePages,
                transition: true,
                middleware: []
            }, options || {});

            const route = {
                path: path,
                handler: handler,
                options: options,
                regex: this._pathToRegex(path),
                keys: this._extractKeys(path)
            };

            this._routes.push(route);
            return this;
        },

        /**
         * Navigate to a path
         */
        navigate: function(path, options) {
            options = Onigiri.extend({
                trigger: true,
                replace: false,
                data: null,
                scroll: this._config.scrollToTop
            }, options || {});

            path = this._normalizePath(path);

            if (path === this._getCurrentPath() && !options.trigger) {
                return this;
            }

            if (this._config.mode === 'history') {
                if (options.replace) {
                    history.replaceState(options.data, '', path);
                } else {
                    history.pushState(options.data, '', path);
                }
            } else {
                window.location.hash = path;
            }

            if (options.trigger) {
                this._handleRoute(path, options);
            }

            return this;
        },

        /**
         * Navigate back
         */
        back: function() {
            history.back();
            return this;
        },

        /**
         * Navigate forward
         */
        forward: function() {
            history.forward();
            return this;
        },

        /**
         * Reload current route
         */
        reload: function(bypassCache) {
            const path = this._getCurrentPath();

            if (bypassCache) {
                this._cache.delete(path);
            }

            this._handleRoute(path, { scroll: false });
            return this;
        },

        /**
         * Get current path
         */
        getCurrentPath: function() {
            return this._getCurrentPath();
        },

        /**
         * Get current route
         */
        getCurrentRoute: function() {
            return this._currentRoute;
        },

        /**
         * Register before navigation hook
         */
        before: function(hook) {
            this._beforeHooks.push(hook);
            return this;
        },

        /**
         * Register after navigation hook
         */
        after: function(hook) {
            this._afterHooks.push(hook);
            return this;
        },

        /**
         * Register error hook
         */
        onError: function(hook) {
            this._errorHooks.push(hook);
            return this;
        },

        /**
         * Generate URL for named route
         */
        url: function(name, params) {
            const route = this._routes.find(r => r.options.name === name);
            if (!route) {
                console.warn(`Route not found: ${name}`);
                return '#';
            }

            let path = route.path;
            if (params) {
                Object.keys(params).forEach(key => {
                    path = path.replace(`:${key}`, params[key]);
                });
            }

            return path;
        },

        /**
         * Clear route cache
         */
        clearCache: function(path) {
            if (path) {
                this._cache.delete(this._normalizePath(path));
            } else {
                this._cache.clear();
            }
            return this;
        },

        /**
         * Prefetch a route
         */
        prefetch: function(path) {
            path = this._normalizePath(path);
            
            if (this._cache.has(path)) {
                return Promise.resolve();
            }

            return this._fetchPage(path).then(html => {
                this._cache.set(path, html);
            }).catch(err => {
                console.warn('Prefetch failed:', err);
            });
        },

        /**
         * Setup event listeners
         */
        _setupEventListeners: function() {
            window.addEventListener('popstate', (e) => {
                this._handleRoute(this._getCurrentPath(), {
                    scroll: false,
                    state: e.state
                });
            });

            document.addEventListener('click', (e) => {
                const link = e.target.closest(this._config.linkSelector);
                if (!link) return;

                e.preventDefault();
                const href = link.getAttribute('href') || link.getAttribute('data-href');
                if (href) {
                    this.navigate(href);
                }
            });

            document.addEventListener('submit', (e) => {
                const form = e.target.closest(this._config.formSelector);
                if (!form) return;

                e.preventDefault();
                this._handleFormSubmit(form);
            });

            if (this._config.prefetch) {
                let prefetchTimeout;
                document.addEventListener('mouseenter', (e) => {
                    const link = e.target.closest(this._config.linkSelector);
                    if (!link) return;

                    const href = link.getAttribute('href');
                    if (!href || href.startsWith('#')) return;

                    clearTimeout(prefetchTimeout);
                    prefetchTimeout = setTimeout(() => {
                        this.prefetch(href);
                    }, this._config.prefetchDelay);
                }, true);
            }
        },

        /**
         * Handle initial route on page load
         */
        _handleInitialRoute: function() {
            const path = this._getCurrentPath();
            this._handleRoute(path, { scroll: false, initial: true });
        },

        /**
         * Handle route change
         */
        _handleRoute: function(path, options) {
            options = options || {};
            const route = this._matchRoute(path);

            const beforeContext = {
                path: path,
                route: route,
                from: this._currentRoute,
                cancel: false
            };

            for (const hook of this._beforeHooks) {
                hook(beforeContext);
                if (beforeContext.cancel) {
                    return;
                }
            }

            if (this._config.pjax && route) {
                this._handlePjaxRoute(path, route, options);
            } else if (route) {
                this._handleCallbackRoute(path, route, options);
            } else {
                window.location.href = path;
            }
        },

        /**
         * Handle PJAX route
         */
        _handlePjaxRoute: function(path, route, options) {
            const container = document.querySelector(this._config.container);
            if (!container) {
                console.warn('PJAX container not found:', this._config.container);
                window.location.href = path;
                return;
            }

            container.classList.add(this._config.loadingClass);

            document.dispatchEvent(new CustomEvent('onigiri:router:beforeLoad', {
                detail: { path, route }
            }));

            if (route.options.cache && this._cache.has(path)) {
                this._renderContent(container, this._cache.get(path), path, route, options);
                return;
            }

            this._fetchPage(path)
                .then(html => {
                    if (route.options.cache) {
                        this._addToCache(path, html);
                    }
                    this._renderContent(container, html, path, route, options);
                })
                .catch(error => {
                    this._handleError(error, path, route);
                    container.classList.remove(this._config.loadingClass);
                });
        },

        /**
         * Handle callback-based route
         */
        _handleCallbackRoute: function(path, route, options) {
            const params = this._extractParams(path, route);
            const context = {
                path: path,
                params: params,
                query: this._parseQuery(path),
                state: options.state || null,
                route: route
            };

            try {
                if (route.options.middleware && route.options.middleware.length > 0) {
                    this._runMiddleware(route.options.middleware, context, () => {
                        route.handler(context);
                        this._afterRouteChange(path, route);
                    });
                } else {
                    route.handler(context);
                    this._afterRouteChange(path, route);
                }
            } catch (error) {
                this._handleError(error, path, route);
            }
        },

        /**
         * Render fetched content
         */
        _renderContent: function(container, html, path, route, options) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            if (this._config.updateTitle) {
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) {
                    document.title = titleMatch[1];
                }
            }

            const newContent = tempDiv.querySelector(this._config.container);
            const content = newContent ? newContent.innerHTML : html;

            if (route.options.transition) {
                container.style.opacity = '0';
                setTimeout(() => {
                    container.innerHTML = content;
                    this._executeScripts(container);

                    requestAnimationFrame(() => {
                        container.style.opacity = '1';
                        container.classList.remove(this._config.loadingClass);
                        this._afterRouteChange(path, route, options);
                    });
                }, this._config.transitionDuration);
            } else {
                container.innerHTML = content;
                this._executeScripts(container);
                container.classList.remove(this._config.loadingClass);
                this._afterRouteChange(path, route, options);
            }
        },

        /**
         * After route change
         */
        _afterRouteChange: function(path, route, options) {
            this._currentRoute = { path, route };

            if (options.scroll !== false && this._config.scrollToTop) {
                window.scrollTo({
                    top: 0,
                    behavior: this._config.scrollBehavior
                });
            }

            const afterContext = {
                path: path,
                route: route,
                from: this._currentRoute
            };

            for (const hook of this._afterHooks) {
                hook(afterContext);
            }

            document.dispatchEvent(new CustomEvent('onigiri:router:complete', {
                detail: { path, route }
            }));
        },

        /**
         * Handle form submission
         */
        _handleFormSubmit: function(form) {
            const action = form.action || window.location.href;
            const method = (form.method || 'GET').toUpperCase();
            const formData = new FormData(form);

            if (this._config.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
                formData.append(
                    Onigiri.security._config.csrfParam,
                    Onigiri.security.getToken()
                );
            }

            const container = document.querySelector(this._config.container);
            if (!container) {
                form.submit();
                return;
            }

            container.classList.add(this._config.loadingClass);

            const fetchOptions = {
                method: method,
                headers: {}
            };

            if (this._config.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
                fetchOptions.headers['X-CSRF-Token'] = Onigiri.security.getToken();
            }

            if (method !== 'GET') {
                fetchOptions.body = formData;
            }

            fetch(action, fetchOptions)
                .then(response => response.text())
                .then(html => {
                    const path = new URL(action).pathname;
                    this._renderContent(container, html, path, null, {});

                    if (method === 'GET') {
                        history.pushState(null, '', action);
                    }
                })
                .catch(error => {
                    this._handleError(error);
                    container.classList.remove(this._config.loadingClass);
                });
        },

        /**
         * Fetch page content
         */
        _fetchPage: function(path) {
            const fetchOptions = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            if (this._config.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
                fetchOptions.headers['X-CSRF-Token'] = Onigiri.security.getToken();
            }

            return fetch(path, fetchOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                });
        },

        /**
         * Execute scripts in container
         */
        _executeScripts: function(container) {
            const scripts = container.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');

                if (Onigiri.modules.security && Onigiri.security.getNonce()) {
                    newScript.setAttribute('nonce', Onigiri.security.getNonce());
                }

                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });

                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        },

        /**
         * Handle errors
         */
        _handleError: function(error, path, route) {
            console.error('OnigiriJS Router Error:', error);

            const errorContext = {
                error: error,
                path: path,
                route: route,
                handled: false
            };

            for (const hook of this._errorHooks) {
                hook(errorContext);
                if (errorContext.handled) {
                    return;
                }
            }

            if (Onigiri.modules.portal) {
                Onigiri.toast('Failed to load page: ' + error.message, {
                    icon: '⚠️',
                    duration: 5000
                });
            }
        },

        /**
         * Run middleware chain
         */
        _runMiddleware: function(middleware, context, callback) {
            let index = 0;

            const next = () => {
                if (index >= middleware.length) {
                    callback();
                    return;
                }

                const fn = middleware[index++];
                fn(context, next);
            };

            next();
        },

        /**
         * Match route
         */
        _matchRoute: function(path) {
            path = this._normalizePath(path);

            for (const route of this._routes) {
                if (route.regex.test(path)) {
                    return route;
                }
            }

            return null;
        },

        /**
         * Extract route parameters
         */
        _extractParams: function(path, route) {
            const matches = path.match(route.regex);
            const params = {};

            if (matches) {
                route.keys.forEach((key, index) => {
                    params[key] = matches[index + 1];
                });
            }

            return params;
        },

        /**
         * Convert path pattern to regex
         */
        _pathToRegex: function(path) {
            const pattern = path
                .replace(/:[^\s/]+/g, '([^/]+)')
                .replace(/\*/g, '(.*)');
            return new RegExp('^' + pattern + '$');
        },

        /**
         * Extract parameter keys from path
         */
        _extractKeys: function(path) {
            const keys = [];
            const matches = path.matchAll(/:([^\s/]+)/g);
            for (const match of matches) {
                keys.push(match[1]);
            }
            return keys;
        },

        /**
         * Parse query string
         */
        _parseQuery: function(path) {
            const queryString = path.split('?')[1];
            if (!queryString) return {};

            const params = {};
            queryString.split('&').forEach(param => {
                const [key, value] = param.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });

            return params;
        },

        /**
         * Get current path
         */
        _getCurrentPath: function() {
            if (this._config.mode === 'history') {
                return window.location.pathname + window.location.search;
            } else {
                return window.location.hash.slice(1) || '/';
            }
        },

        /**
         * Normalize path
         */
        _normalizePath: function(path) {
            if (path !== '/' && path.endsWith('/')) {
                path = path.slice(0, -1);
            }
            return path;
        },

        /**
         * Add to cache
         */
        _addToCache: function(path, content) {
            if (this._cache.size >= this._config.maxCache) {
                const firstKey = this._cache.keys().next().value;
                this._cache.delete(firstKey);
            }
            this._cache.set(path, content);
        }
    };

    /**
     * Add router shorthand to Onigiri
     */
    Onigiri.route = function(path, handler, options) {
        return Onigiri.router.route(path, handler, options);
    };

    Onigiri.navigate = function(path, options) {
        return Onigiri.router.navigate(path, options);
    };

    Onigiri.modules.router = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
