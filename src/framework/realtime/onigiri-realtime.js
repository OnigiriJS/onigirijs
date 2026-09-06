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
        throw new Error('OnigiriJS core not found. Load onigiri-core.js first.');
    }

    /**
     * Realtime Module - SSE Support
     */
    Onigiri.realtime = {
        _config: {
            reconnect: true,
            reconnectInterval: 3000,
            maxReconnectAttempts: 10,
            heartbeatInterval: 30000,
            withCredentials: false
        },

        _connections: new Map(),
        _eventHandlers: new Map(),
        _reconnectAttempts: new Map(),

        /**
         * Initialize realtime module
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});
            return this;
        },

        /**
         * Connect to SSE endpoint
         */
        connect: function(url, options) {
            options = Onigiri.extend({}, this._config, options || {});

            // Check if already connected
            if (this._connections.has(url)) {
                console.warn('Already connected to:', url);
                return this._connections.get(url);
            }

            const connection = this._createConnection(url, options);
            this._connections.set(url, connection);

            return connection;
        },

        /**
         * Disconnect from SSE endpoint
         */
        disconnect: function(url) {
            const connection = this._connections.get(url);
            if (connection) {
                // `connection` is a plain object - it has no `.close()`
                // method of its own (only `connection.source` does).
                // Calling `connection.close()` here always threw.
                if (connection.heartbeatTimer) {
                    clearInterval(connection.heartbeatTimer);
                }
                connection.source.close();
                this._connections.delete(url);
                this._eventHandlers.delete(url);
                this._reconnectAttempts.delete(url);
            }
            return this;
        },

        /**
         * Disconnect all connections
         */
        disconnectAll: function() {
            this._connections.forEach((connection, url) => {
                this.disconnect(url);
            });
            return this;
        },

        /**
         * Create SSE connection
         */
        _createConnection: function(url, options) {
            const eventSource = new EventSource(url, {
                withCredentials: options.withCredentials
            });

            const connection = {
                url: url,
                source: eventSource,
                options: options,
                handlers: new Map(),
                status: 'connecting',
                lastEvent: null,
                heartbeatTimer: null
            };

            // Setup event listeners
            eventSource.onopen = () => {
                connection.status = 'connected';
                this._reconnectAttempts.set(url, 0);
                
                this._emit(url, 'open', { url });
                
                // Start heartbeat
                if (options.heartbeatInterval > 0) {
                    this._startHeartbeat(connection);
                }

                document.dispatchEvent(new CustomEvent('onigiri:realtime:connected', {
                    detail: { url }
                }));
            };

            eventSource.onmessage = (event) => {
                connection.lastEvent = Date.now();
                
                try {
                    const data = JSON.parse(event.data);
                    this._emit(url, 'message', data);
                } catch (e) {
                    this._emit(url, 'message', event.data);
                }
            };

            eventSource.onerror = (error) => {
                connection.status = 'error';
                this._emit(url, 'error', error);

                // Attempt reconnect
                if (options.reconnect) {
                    this._handleReconnect(url, connection);
                }

                document.dispatchEvent(new CustomEvent('onigiri:realtime:error', {
                    detail: { url, error }
                }));
            };

            return connection;
        },

        /**
         * Register event handler
         */
        on: function(url, eventType, handler) {
            const connection = this._connections.get(url);
            if (!connection) {
                console.warn('No connection found for:', url);
                return this;
            }

            // Store handler
            if (!this._eventHandlers.has(url)) {
                this._eventHandlers.set(url, new Map());
            }

            const handlers = this._eventHandlers.get(url);
            if (!handlers.has(eventType)) {
                handlers.set(eventType, []);
            }
            handlers.get(eventType).push(handler);

            // Register with EventSource for custom events
            if (!['open', 'message', 'error'].includes(eventType)) {
                connection.source.addEventListener(eventType, (event) => {
                    connection.lastEvent = Date.now();
                    
                    try {
                        const data = JSON.parse(event.data);
                        this._emit(url, eventType, data);
                    } catch (e) {
                        this._emit(url, eventType, event.data);
                    }
                });
            }

            return this;
        },

        /**
         * Remove event handler
         */
        off: function(url, eventType, handler) {
            if (!this._eventHandlers.has(url)) return this;

            const handlers = this._eventHandlers.get(url);
            if (handlers.has(eventType)) {
                if (handler) {
                    const eventHandlers = handlers.get(eventType);
                    const index = eventHandlers.indexOf(handler);
                    if (index > -1) {
                        eventHandlers.splice(index, 1);
                    }
                } else {
                    handlers.delete(eventType);
                }
            }

            return this;
        },

        /**
         * Emit event to handlers
         */
        _emit: function(url, eventType, data) {
            if (!this._eventHandlers.has(url)) return;

            const handlers = this._eventHandlers.get(url);
            if (handlers.has(eventType)) {
                handlers.get(eventType).forEach(handler => {
                    try {
                        handler(data);
                    } catch (e) {
                        console.error('Error in event handler:', e);
                    }
                });
            }
        },

        /**
         * Handle reconnection
         */
        _handleReconnect: function(url, connection) {
            const attempts = this._reconnectAttempts.get(url) || 0;
            
            if (attempts >= connection.options.maxReconnectAttempts) {
                console.error('Max reconnect attempts reached for:', url);
                this._emit(url, 'reconnect-failed', { url, attempts });
                return;
            }

            this._reconnectAttempts.set(url, attempts + 1);

            setTimeout(() => {
                // Clear the outgoing connection's heartbeat before
                // replacing it - otherwise every reconnect leaves the
                // previous setInterval running forever, each one still
                // polling a stale connection object and independently
                // triggering its own reconnect on timeout.
                if (connection.heartbeatTimer) {
                    clearInterval(connection.heartbeatTimer);
                }

                // Close old connection
                connection.source.close();
                
                // Create new connection
                const newConnection = this._createConnection(url, connection.options);
                this._connections.set(url, newConnection);

                this._emit(url, 'reconnecting', { url, attempts: attempts + 1 });
            }, connection.options.reconnectInterval);
        },

        /**
         * Start heartbeat monitoring
         */
        _startHeartbeat: function(connection) {
            if (connection.heartbeatTimer) {
                clearInterval(connection.heartbeatTimer);
            }

            connection.heartbeatTimer = setInterval(() => {
                const now = Date.now();
                const lastEvent = connection.lastEvent || now;
                const timeSinceLastEvent = now - lastEvent;

                if (timeSinceLastEvent > connection.options.heartbeatInterval * 2) {
                    console.warn('Heartbeat timeout, reconnecting...');
                    this._handleReconnect(connection.url, connection);
                }
            }, connection.options.heartbeatInterval);
        },

        /**
         * Get connection status
         */
        getStatus: function(url) {
            const connection = this._connections.get(url);
            return connection ? connection.status : 'disconnected';
        },

        /**
         * Check if connected
         */
        isConnected: function(url) {
            return this.getStatus(url) === 'connected';
        },

        /**
         * Get all active connections
         */
        getConnections: function() {
            return Array.from(this._connections.keys());
        },

        /**
         * Subscribe to multiple event types
         */
        subscribe: function(url, events) {
            Object.keys(events).forEach(eventType => {
                this.on(url, eventType, events[eventType]);
            });
            return this;
        },

        /**
         * Close connection gracefully
         */
        close: function(url) {
            const connection = this._connections.get(url);
            if (connection) {
                if (connection.heartbeatTimer) {
                    clearInterval(connection.heartbeatTimer);
                }
                connection.source.close();
                connection.status = 'closed';
                this._emit(url, 'close', { url });
                
                document.dispatchEvent(new CustomEvent('onigiri:realtime:closed', {
                    detail: { url }
                }));
            }
            this._connections.delete(url);
            this._eventHandlers.delete(url);
            this._reconnectAttempts.delete(url);
            return this;
        }
    };

    /**
     * Convenience class for SSE connections
     */
    Onigiri.SSE = function(url, options) {
        this.url = url;
        this.connection = Onigiri.realtime.connect(url, options);
        return this;
    };

    Onigiri.SSE.prototype = {
        on: function(eventType, handler) {
            Onigiri.realtime.on(this.url, eventType, handler);
            return this;
        },

        off: function(eventType, handler) {
            Onigiri.realtime.off(this.url, eventType, handler);
            return this;
        },

        close: function() {
            Onigiri.realtime.close(this.url);
            return this;
        },

        isConnected: function() {
            return Onigiri.realtime.isConnected(this.url);
        },

        getStatus: function() {
            return Onigiri.realtime.getStatus(this.url);
        }
    };

    /**
     * Helper: Live counter
     */
    Onigiri.liveCounter = function(url, selector, options) {
        options = Onigiri.extend({
            eventType: 'count',
            initialValue: 0,
            format: (value) => value,
            animate: true
        }, options || {});

        const element = typeof selector === 'string' 
            ? document.querySelector(selector)
            : selector;

        if (!element) {
            console.warn('Element not found for live counter');
            return null;
        }

        let currentValue = options.initialValue;
        element.textContent = options.format(currentValue);

        const connection = Onigiri.realtime.connect(url);
        
        Onigiri.realtime.on(url, options.eventType, (data) => {
            const newValue = typeof data === 'object' ? data.count : data;
            
            if (options.animate) {
                animateCounter(element, currentValue, newValue, options.format);
            } else {
                element.textContent = options.format(newValue);
            }
            
            currentValue = newValue;
        });

        return connection;
    };

    /**
     * Helper: Live list
     */
    Onigiri.liveList = function(url, selector, options) {
        const escapeHtml = Onigiri.security && Onigiri.security.sanitizeHTML
            ? Onigiri.security.sanitizeHTML
            : (str) => String(str).replace(/[&<>"']/g, (c) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[c]));

        options = Onigiri.extend({
            eventType: 'item',
            // Escaped by default: this renders whatever the server pushes
            // over SSE straight into the page via innerHTML. A custom
            // `template` that interpolates server data without escaping
            // it re-opens the same risk - escape any dynamic fields in
            // your own template too.
            template: (item) => `<li>${escapeHtml(JSON.stringify(item))}</li>`,
            prepend: true,
            maxItems: 100,
            animate: true
        }, options || {});

        const element = typeof selector === 'string' 
            ? document.querySelector(selector)
            : selector;

        if (!element) {
            console.warn('Element not found for live list');
            return null;
        }

        const connection = Onigiri.realtime.connect(url);
        
        Onigiri.realtime.on(url, options.eventType, (data) => {
            const html = options.template(data);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const newItem = tempDiv.firstElementChild;

            if (options.animate) {
                newItem.style.opacity = '0';
                newItem.style.transform = 'translateY(-10px)';
            }

            if (options.prepend) {
                element.insertBefore(newItem, element.firstChild);
            } else {
                element.appendChild(newItem);
            }

            if (options.animate) {
                requestAnimationFrame(() => {
                    newItem.style.transition = 'opacity 0.3s, transform 0.3s';
                    newItem.style.opacity = '1';
                    newItem.style.transform = 'translateY(0)';
                });
            }

            // Remove old items if exceeding max
            while (element.children.length > options.maxItems) {
                const itemToRemove = options.prepend 
                    ? element.lastChild 
                    : element.firstChild;
                
                if (itemToRemove) {
                    element.removeChild(itemToRemove);
                }
            }
        });

        return connection;
    };

    /**
     * Helper: Live badge/indicator
     */
    Onigiri.liveBadge = function(url, selector, options) {
        options = Onigiri.extend({
            eventType: 'badge',
            format: (value) => value,
            threshold: 0,
            className: 'badge-active'
        }, options || {});

        const element = typeof selector === 'string' 
            ? document.querySelector(selector)
            : selector;

        if (!element) {
            console.warn('Element not found for live badge');
            return null;
        }

        const connection = Onigiri.realtime.connect(url);
        
        Onigiri.realtime.on(url, options.eventType, (data) => {
            const value = typeof data === 'object' ? data.value : data;
            element.textContent = options.format(value);

            if (value > options.threshold) {
                element.classList.add(options.className);
            } else {
                element.classList.remove(options.className);
            }
        });

        return connection;
    };

    /**
     * Animate counter
     */
    function animateCounter(element, start, end, format) {
        const duration = 500;
        const startTime = Date.now();
        const difference = end - start;

        function update() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const value = Math.floor(start + difference * progress);
            
            element.textContent = format(value);

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize realtime module
    Onigiri.realtime.init();

    Onigiri.modules.realtime = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
