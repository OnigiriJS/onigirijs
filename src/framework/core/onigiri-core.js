(function(global) {
    'use strict';

    /**
     * Core OnigiriJS constructor
     */
    function Onigiri(selector, context) {
        if (!(this instanceof Onigiri)) {
            return new Onigiri(selector, context);
        }
        
        this.elements = [];
        this.context = context || document;
        
        if (typeof selector === 'string') {
            this.elements = Array.from(this.context.querySelectorAll(selector));
        } else if (selector instanceof HTMLElement) {
            this.elements = [selector];
        } else if (selector instanceof NodeList || Array.isArray(selector)) {
            this.elements = Array.from(selector);
        }
        
        this.length = this.elements.length;
        return this;
    }

    /**
     * Version and metadata
     */
    Onigiri.version = '1.0.0';
    Onigiri.modules = {};

    /**
     * DOM Manipulation Methods
     */
    Onigiri.prototype.each = function(callback) {
        this.elements.forEach((el, idx) => callback.call(el, el, idx));
        return this;
    };

    Onigiri.prototype.on = function(event, selector, handler) {
        if (typeof selector === 'function') {
            handler = selector;
            selector = null;
        }

        this.each(el => {
            if (selector) {
                el.addEventListener(event, e => {
                    if (e.target.matches(selector)) {
                        handler.call(e.target, e);
                    }
                });
            } else {
                el.addEventListener(event, handler);
            }
        });
        return this;
    };

    Onigiri.prototype.off = function(event, handler) {
        this.each(el => el.removeEventListener(event, handler));
        return this;
    };

    Onigiri.prototype.trigger = function(event, data) {
        this.each(el => {
            const evt = new CustomEvent(event, { detail: data, bubbles: true });
            el.dispatchEvent(evt);
        });
        return this;
    };

    Onigiri.prototype.addClass = function(className) {
        this.each(el => el.classList.add(className));
        return this;
    };

    Onigiri.prototype.removeClass = function(className) {
        this.each(el => el.classList.remove(className));
        return this;
    };

    Onigiri.prototype.toggleClass = function(className) {
        this.each(el => el.classList.toggle(className));
        return this;
    };

    Onigiri.prototype.hasClass = function(className) {
        return this.elements[0] ? this.elements[0].classList.contains(className) : false;
    };

    Onigiri.prototype.attr = function(name, value) {
        if (value === undefined) {
            return this.elements[0] ? this.elements[0].getAttribute(name) : null;
        }
        this.each(el => el.setAttribute(name, value));
        return this;
    };

    Onigiri.prototype.removeAttr = function(name) {
        this.each(el => el.removeAttribute(name));
        return this;
    };

    Onigiri.prototype.data = function(key, value) {
        if (value === undefined) {
            return this.elements[0] ? this.elements[0].dataset[key] : null;
        }
        this.each(el => el.dataset[key] = value);
        return this;
    };

    Onigiri.prototype.html = function(content) {
        if (content === undefined) {
            return this.elements[0] ? this.elements[0].innerHTML : null;
        }
        this.each(el => el.innerHTML = content);
        return this;
    };

    Onigiri.prototype.text = function(content) {
        if (content === undefined) {
            return this.elements[0] ? this.elements[0].textContent : null;
        }
        this.each(el => el.textContent = content);
        return this;
    };

    Onigiri.prototype.val = function(value) {
        if (value === undefined) {
            return this.elements[0] ? this.elements[0].value : null;
        }
        this.each(el => el.value = value);
        return this;
    };

    Onigiri.prototype.css = function(prop, value) {
        if (typeof prop === 'object') {
            this.each(el => {
                Object.keys(prop).forEach(key => {
                    el.style[key] = prop[key];
                });
            });
        } else if (value === undefined) {
            return this.elements[0] ? 
                window.getComputedStyle(this.elements[0])[prop] : null;
        } else {
            this.each(el => el.style[prop] = value);
        }
        return this;
    };

    Onigiri.prototype.show = function() {
        this.each(el => el.style.display = '');
        return this;
    };

    Onigiri.prototype.hide = function() {
        this.each(el => el.style.display = 'none');
        return this;
    };

    Onigiri.prototype.append = function(content) {
        this.each(el => {
            if (typeof content === 'string') {
                el.insertAdjacentHTML('beforeend', content);
            } else if (content instanceof HTMLElement) {
                el.appendChild(content);
            }
        });
        return this;
    };

    Onigiri.prototype.prepend = function(content) {
        this.each(el => {
            if (typeof content === 'string') {
                el.insertAdjacentHTML('afterbegin', content);
            } else if (content instanceof HTMLElement) {
                el.insertBefore(content, el.firstChild);
            }
        });
        return this;
    };

    Onigiri.prototype.remove = function() {
        this.each(el => el.remove());
        return this;
    };

    Onigiri.prototype.empty = function() {
        this.each(el => el.innerHTML = '');
        return this;
    };

    Onigiri.prototype.find = function(selector) {
        const found = [];
        this.each(el => {
            found.push(...el.querySelectorAll(selector));
        });
        return new Onigiri(found);
    };

    Onigiri.prototype.parent = function() {
        const parents = this.elements.map(el => el.parentElement).filter(Boolean);
        return new Onigiri(parents);
    };

    Onigiri.prototype.children = function() {
        const children = [];
        this.each(el => children.push(...el.children));
        return new Onigiri(children);
    };

    Onigiri.prototype.siblings = function() {
        const siblings = [];
        this.each(el => {
            siblings.push(...Array.from(el.parentElement.children).filter(child => child !== el));
        });
        return new Onigiri(siblings);
    };

    /**
     * Utility Methods
     */
    Onigiri.extend = function(target, ...sources) {
        sources.forEach(source => {
            Object.keys(source).forEach(key => {
                target[key] = source[key];
            });
        });
        return target;
    };

    Onigiri.debounce = function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    Onigiri.throttle = function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    Onigiri.isArray = Array.isArray;
    
    Onigiri.isObject = function(obj) {
        return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
    };

    Onigiri.isFunction = function(func) {
        return typeof func === 'function';
    };

    Onigiri.isEmpty = function(obj) {
        if (obj == null) return true;
        if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
        return Object.keys(obj).length === 0;
    };

    Onigiri.clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Plugin System
     */
    Onigiri.plugins = {};
    
    Onigiri.use = function(plugin, options) {
        if (typeof plugin === 'function') {
            plugin(Onigiri, options);
        } else if (plugin && typeof plugin.install === 'function') {
            plugin.install(Onigiri, options);
        }
        return Onigiri;
    };

    // Export to global scope
    global.Onigiri = Onigiri;
    global.O = Onigiri;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function() { return Onigiri; });
    }

    // CommonJS support
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Onigiri;
    }

})(typeof window !== 'undefined' ? window : this);
