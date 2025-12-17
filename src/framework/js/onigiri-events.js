(function(Onigiri) {
    'use strict';

    if (!Onigiri) {
        throw new Error('OnigiriJS core not found. Load onigiri.core.js first.');
    }

    /**
     * Event System - Advanced event handling with namespacing
     */
    Onigiri.prototype.EventEmitter = function() {
        this._events = {};
        this._onceEvents = new Set();
    };

    Onigiri.prototype.EventEmitter.prototype = {
        on: function(event, handler, namespace) {
            const key = namespace ? `${event}.${namespace}` : event;
            if (!this._events[key]) {
                this._events[key] = [];
            }
            this._events[key].push(handler);
            return this;
        },

        once: function(event, handler, namespace) {
            const key = namespace ? `${event}.${namespace}` : event;
            const wrappedHandler = (...args) => {
                handler.apply(this, args);
                this.off(event, wrappedHandler, namespace);
            };
            this._onceEvents.add(wrappedHandler);
            return this.on(event, wrappedHandler, namespace);
        },

        off: function(event, handler, namespace) {
            if (!event) {
                this._events = {};
                return this;
            }

            const key = namespace ? `${event}.${namespace}` : event;
            
            if (!handler) {
                delete this._events[key];
                return this;
            }

            if (this._events[key]) {
                this._events[key] = this._events[key].filter(h => h !== handler);
            }
            return this;
        },

        emit: function(event, ...args) {
            const handlers = [];
            
            Object.keys(this._events).forEach(key => {
                if (key === event || key.startsWith(event + '.')) {
                    handlers.push(...this._events[key]);
                }
            });

            handlers.forEach(handler => {
                try {
                    handler.apply(this, args);
                } catch (e) {
                    console.error('OnigiriJS Event Error:', e);
                }
            });
            
            return this;
        }
    };

    Onigiri.modules.events = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
