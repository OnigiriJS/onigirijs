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
     * PJAX Support with CSRF Protection
     */
    Onigiri.pjax = {
        _config: {
            timeout: 5000,
            push: true,
            replace: false,
            scrollTo: 0,
            maxCacheLength: 20,
            csrf: true
        },

        _cache: {},
        _currentXhr: null,

        init: function(options) {
            Onigiri.extend(this._config, options || {});
            this._bindEvents();
            return this;
        },

        _bindEvents: function() {
            const self = this;
            
            window.addEventListener('popstate', function(e) {
                if (e.state && e.state.pjax) {
                    self._loadUrl(location.href, {
                        push: false,
                        scrollTo: e.state.scrollPos || 0
                    });
                }
            });

            document.addEventListener('click', function(e) {
                const link = e.target.closest('a[data-pjax]');
                if (link && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    const container = link.getAttribute('data-pjax') || '#pjax-container';
                    self.load(link.href, { container: container });
                }
            });

            document.addEventListener('submit', function(e) {
                const form = e.target;
                if (form.hasAttribute('data-pjax')) {
                    e.preventDefault();
                    const container = form.getAttribute('data-pjax') || '#pjax-container';
                    self.submit(form, { container: container });
                }
            });
        },

        load: function(url, options) {
            options = Onigiri.extend({}, this._config, options || {});
            return this._loadUrl(url, options);
        },

        _loadUrl: function(url, options) {
            const self = this;
            const container = document.querySelector(options.container || '#pjax-container');
            
            if (!container) {
                console.error('OnigiriJS PJAX: Container not found');
                window.location = url;
                return;
            }

            if (this._currentXhr) {
                this._currentXhr.abort();
            }

            const beforeEvent = new CustomEvent('onigiri:pjax:before', {
                detail: { url: url, options: options },
                cancelable: true
            });
            
            if (!document.dispatchEvent(beforeEvent)) {
                return Promise.reject('PJAX cancelled');
            }

            if (this._cache[url] && !options.nocache) {
                this._renderContent(container, this._cache[url], url, options);
                return Promise.resolve(this._cache[url]);
            }

            container.classList.add('pjax-loading');

            this._currentXhr = new XMLHttpRequest();
            const xhr = this._currentXhr;

            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error('PJAX timeout'));
                    window.location = url;
                }, options.timeout);

                xhr.open('GET', url, true);
                xhr.setRequestHeader('X-PJAX', 'true');
                xhr.setRequestHeader('X-PJAX-Container', options.container || '#pjax-container');

                // Add CSRF token if security module is loaded
                if (options.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
                    xhr.setRequestHeader(
                        Onigiri.security._config.csrfHeader, 
                        Onigiri.security.getToken()
                    );
                }

                xhr.onload = function() {
                    clearTimeout(timeout);
                    container.classList.remove('pjax-loading');

                    if (xhr.status >= 200 && xhr.status < 300) {
                        const content = xhr.responseText;
                        self._addToCache(url, content);
                        self._renderContent(container, content, url, options);
                        resolve(content);
                    } else {
                        reject(new Error(`HTTP ${xhr.status}`));
                        window.location = url;
                    }
                };

                xhr.onerror = function() {
                    clearTimeout(timeout);
                    container.classList.remove('pjax-loading');
                    reject(new Error('Network error'));
                    window.location = url;
                };

                xhr.send();
            });
        },

        _renderContent: function(container, content, url, options) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            
            const newContent = tempDiv.querySelector(options.container || '#pjax-container');
            if (newContent) {
                content = newContent.innerHTML;
            }

            container.innerHTML = content;

            if (options.push) {
                history.pushState(
                    { pjax: true, container: options.container, scrollPos: window.scrollY },
                    '',
                    url
                );
            } else if (options.replace) {
                history.replaceState(
                    { pjax: true, container: options.container, scrollPos: window.scrollY },
                    '',
                    url
                );
            }

            if (options.scrollTo !== false) {
                window.scrollTo(0, options.scrollTo);
            }

            document.dispatchEvent(new CustomEvent('onigiri:pjax:complete', {
                detail: { url: url, container: container }
            }));

            this._executeScripts(container);
        },

        _executeScripts: function(container) {
            const scripts = container.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                
                // Copy CSP nonce if available
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

        submit: function(form, options) {
            options = Onigiri.extend({}, this._config, options || {});
            
            const formData = new FormData(form);
            
            // Add CSRF token if security module is loaded
            if (options.csrf && Onigiri.modules.security && Onigiri.security.getToken()) {
                formData.append(
                    Onigiri.security._config.csrfParam,
                    Onigiri.security.getToken()
                );
            }
            
            const method = (form.method || 'POST').toUpperCase();
            const url = form.action || window.location.href;
            const container = document.querySelector(options.container || '#pjax-container');

            if (!container) {
                form.submit();
                return;
            }

            container.classList.add('pjax-loading');

            const xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.setRequestHeader('X-PJAX', 'true');
            xhr.setRequestHeader('X-PJAX-Container', options.container || '#pjax-container');

            xhr.onload = () => {
                container.classList.remove('pjax-loading');
                if (xhr.status >= 200 && xhr.status < 300) {
                    this._renderContent(container, xhr.responseText, url, options);
                } else {
                    form.submit();
                }
            };

            xhr.onerror = () => {
                container.classList.remove('pjax-loading');
                form.submit();
            };

            xhr.send(formData);
        },

        _addToCache: function(url, content) {
            const keys = Object.keys(this._cache);
            
            if (keys.length >= this._config.maxCacheLength) {
                delete this._cache[keys[0]];
            }
            
            this._cache[url] = content;
        },

        clearCache: function(url) {
            if (url) {
                delete this._cache[url];
            } else {
                this._cache = {};
            }
        }
    };

    Onigiri.modules.pjax = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
