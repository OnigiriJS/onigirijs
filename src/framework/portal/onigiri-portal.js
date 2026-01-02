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
     * Portal System - DOM Teleportation and Overlay Management
     */
    Onigiri.portal = {
        _config: {
            portalContainer: 'body',
            overlayClass: 'onigiri-overlay',
            portalClass: 'onigiri-portal',
            stackClass: 'onigiri-portal-stack',
            animationDuration: 300,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            lockScroll: true,
            stackPortals: true,
            zIndexBase: 9000
        },

        _portals: new Map(),
        _stack: [],
        _portalCounter: 0,

        /**
         * Initialize portal system
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});
            this._setupGlobalHandlers();
            this._ensurePortalRoot();
            return this;
        },

        /**
         * Create a new portal
         */
        create: function(content, options) {
            options = Onigiri.extend({}, this._config, options || {});

            const portalId = 'portal-' + (++this._portalCounter);
            const portal = this._buildPortal(portalId, content, options);

            this._portals.set(portalId, {
                element: portal,
                options: options,
                originalParent: null,
                originalNextSibling: null
            });

            return {
                id: portalId,
                element: portal,
                mount: () => this.mount(portalId),
                unmount: () => this.unmount(portalId),
                destroy: () => this.destroy(portalId),
                update: (newContent) => this.update(portalId, newContent)
            };
        },

        /**
         * Teleport existing element to portal
         */
        teleport: function(element, targetSelector, options) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            if (!element) {
                throw new Error('Element not found for teleportation');
            }

            const target = targetSelector 
                ? document.querySelector(targetSelector)
                : document.querySelector(this._config.portalContainer);

            if (!target) {
                throw new Error('Target container not found');
            }

            options = Onigiri.extend({
                returnOnUnmount: true,
                animate: true
            }, options || {});

            const originalParent = element.parentElement;
            const originalNextSibling = element.nextElementSibling;

            if (options.animate) {
                element.style.opacity = '0';
                element.style.transition = `opacity ${this._config.animationDuration}ms`;
            }

            target.appendChild(element);

            if (options.animate) {
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                });
            }

            return {
                element: element,
                return: () => {
                    if (options.returnOnUnmount && originalParent) {
                        if (originalNextSibling) {
                            originalParent.insertBefore(element, originalNextSibling);
                        } else {
                            originalParent.appendChild(element);
                        }
                    }
                }
            };
        },

        /**
         * Mount portal (show it)
         */
        mount: function(portalId) {
            const portal = this._portals.get(portalId);
            if (!portal) {
                throw new Error('Portal not found: ' + portalId);
            }

            const container = document.querySelector(this._config.portalContainer);
            if (!container) {
                throw new Error('Portal container not found');
            }

            if (this._config.stackPortals) {
                this._stack.push(portalId);
                const zIndex = this._config.zIndexBase + this._stack.length;
                portal.element.style.zIndex = zIndex;
            }

            if (portal.options.lockScroll) {
                this._lockScroll();
            }

            container.appendChild(portal.element);

            requestAnimationFrame(() => {
                portal.element.classList.add('active');
            });

            document.dispatchEvent(new CustomEvent('onigiri:portal:mounted', {
                detail: { portalId, portal: portal.element }
            }));

            return this;
        },

        /**
         * Unmount portal (hide it)
         */
        unmount: function(portalId, callback) {
            const portal = this._portals.get(portalId);
            if (!portal) return this;

            portal.element.classList.remove('active');

            setTimeout(() => {
                if (portal.element.parentElement) {
                    portal.element.parentElement.removeChild(portal.element);
                }

                const stackIndex = this._stack.indexOf(portalId);
                if (stackIndex > -1) {
                    this._stack.splice(stackIndex, 1);
                }

                if (this._stack.length === 0 && portal.options.lockScroll) {
                    this._unlockScroll();
                }

                document.dispatchEvent(new CustomEvent('onigiri:portal:unmounted', {
                    detail: { portalId }
                }));

                if (callback) callback();
            }, this._config.animationDuration);

            return this;
        },

        /**
         * Destroy portal completely
         */
        destroy: function(portalId) {
            this.unmount(portalId, () => {
                this._portals.delete(portalId);
            });
            return this;
        },

        /**
         * Update portal content
         */
        update: function(portalId, content) {
            const portal = this._portals.get(portalId);
            if (!portal) return this;

            const contentContainer = portal.element.querySelector('.portal-content');
            if (contentContainer) {
                if (typeof content === 'string') {
                    contentContainer.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    contentContainer.innerHTML = '';
                    contentContainer.appendChild(content);
                }
            }

            return this;
        },

        /**
         * Get active portal
         */
        getActive: function() {
            if (this._stack.length === 0) return null;
            const activeId = this._stack[this._stack.length - 1];
            return this._portals.get(activeId);
        },

        /**
         * Close top portal
         */
        closeTop: function() {
            if (this._stack.length > 0) {
                const topId = this._stack[this._stack.length - 1];
                this.unmount(topId);
            }
            return this;
        },

        /**
         * Close all portals
         */
        closeAll: function() {
            const portalsToClose = [...this._stack];
            portalsToClose.forEach(id => this.unmount(id));
            return this;
        },

        /**
         * Build portal element
         */
        _buildPortal: function(portalId, content, options) {
            const portal = document.createElement('div');
            portal.className = this._config.portalClass;
            portal.setAttribute('data-portal-id', portalId);

            if (options.overlay !== false) {
                const overlay = document.createElement('div');
                overlay.className = this._config.overlayClass;

                if (options.closeOnOverlayClick) {
                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            this.unmount(portalId);
                        }
                    });
                }

                portal.appendChild(overlay);
            }

            const contentContainer = document.createElement('div');
            contentContainer.className = 'portal-content';

            if (typeof content === 'string') {
                contentContainer.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                contentContainer.appendChild(content);
            }

            if (options.closeButton !== false) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'portal-close';
                closeBtn.innerHTML = '×';
                closeBtn.setAttribute('aria-label', 'Close');
                closeBtn.addEventListener('click', () => this.unmount(portalId));
                contentContainer.appendChild(closeBtn);
            }

            portal.appendChild(contentContainer);

            return portal;
        },

        /**
         * Setup global event handlers
         */
        _setupGlobalHandlers: function() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this._config.closeOnEscape) {
                    this.closeTop();
                }
            });
        },

        /**
         * Ensure portal root exists
         */
        _ensurePortalRoot: function() {
            const container = document.querySelector(this._config.portalContainer);
            if (!container) {
                throw new Error('Portal container not found: ' + this._config.portalContainer);
            }

            if (!document.getElementById('onigiri-portal-styles')) {
                this._injectStyles();
            }
        },

        /**
         * Lock body scroll
         */
        _lockScroll: function() {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = scrollbarWidth + 'px';
        },

        /**
         * Unlock body scroll
         */
        _unlockScroll: function() {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        },

        /**
         * Inject default styles
         */
        _injectStyles: function() {
            const styles = `
                .onigiri-portal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity ${this._config.animationDuration}ms ease-in-out,
                                visibility ${this._config.animationDuration}ms ease-in-out;
                }

                .onigiri-portal.active {
                    opacity: 1;
                    visibility: visible;
                }

                .onigiri-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                }

                .portal-content {
                    position: relative;
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 90%;
                    max-height: 90%;
                    overflow: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    transform: scale(0.9);
                    transition: transform ${this._config.animationDuration}ms ease-out;
                }

                .onigiri-portal.active .portal-content {
                    transform: scale(1);
                }

                .portal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 50%;
                    font-size: 24px;
                    line-height: 1;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .portal-close:hover {
                    background: rgba(0, 0, 0, 0.2);
                }

                [data-theme="dark"] .portal-content {
                    background: #1f2937;
                    color: #f9fafb;
                }

                [data-theme="dark"] .portal-close {
                    background: rgba(255, 255, 255, 0.1);
                }

                [data-theme="dark"] .portal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                /* Toast Styles */
                .onigiri-toast {
                    position: fixed;
                    padding: 1rem 1.5rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    max-width: 400px;
                    min-width: 250px;
                    pointer-events: auto;
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out, transform 0.3s ease-out;
                }

                .onigiri-toast-top-right { 
                    top: 1rem; 
                    right: 1rem;
                    transform: translateX(400px);
                }

                .onigiri-toast-top-left { 
                    top: 1rem; 
                    left: 1rem;
                    transform: translateX(-400px);
                }

                .onigiri-toast-bottom-right { 
                    bottom: 1rem; 
                    right: 1rem;
                    transform: translateX(400px);
                }

                .onigiri-toast-bottom-left { 
                    bottom: 1rem; 
                    left: 1rem;
                    transform: translateX(-400px);
                }

                .onigiri-toast-top-center { 
                    top: 1rem; 
                    left: 50%; 
                    transform: translate(-50%, -100px);
                }

                .onigiri-toast-bottom-center { 
                    bottom: 1rem; 
                    left: 50%; 
                    transform: translate(-50%, 100px);
                }

                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .toast-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                .toast-message {
                    flex: 1;
                    line-height: 1.5;
                }

                [data-theme="dark"] .onigiri-toast {
                    background: #1f2937;
                    color: #f9fafb;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
            `;

            const styleElement = document.createElement('style');
            styleElement.id = 'onigiri-portal-styles';
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    };

    /**
     * Add portal methods to Onigiri prototype
     */
    Onigiri.prototype.portal = function(options) {
        const content = this.elements[0] ? this.elements[0].cloneNode(true) : null;
        if (!content) {
            throw new Error('No element found to create portal from');
        }
        return Onigiri.portal.create(content, options);
    };

    Onigiri.prototype.teleport = function(targetSelector, options) {
        const teleports = [];
        this.each(el => {
            teleports.push(Onigiri.portal.teleport(el, targetSelector, options));
        });
        return teleports.length === 1 ? teleports[0] : teleports;
    };

    /**
     * Helper: Create modal portal
     */
    Onigiri.modal = function(content, options) {
        options = Onigiri.extend({
            overlay: true,
            closeButton: true,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            lockScroll: true
        }, options || {});

        return Onigiri.portal.create(content, options);
    };

    /**
     * Helper: Create toast/notification portal
     */
    Onigiri.toast = function(message, options) {
        options = Onigiri.extend({
            duration: 3000,
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            icon: null
        }, options || {});

        const toast = document.createElement('div');
        toast.className = 'onigiri-toast onigiri-toast-' + options.position;
        toast.innerHTML = `
            <div class="toast-content">
                ${options.icon ? `<span class="toast-icon">${options.icon}</span>` : ''}
                <span class="toast-message">${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            if (options.position === 'top-right' || options.position === 'bottom-right') {
                toast.style.transform = 'translateX(0)';
            } else if (options.position === 'top-left' || options.position === 'bottom-left') {
                toast.style.transform = 'translateX(0)';
            } else if (options.position === 'top-center') {
                toast.style.transform = 'translate(-50%, 0)';
            } else if (options.position === 'bottom-center') {
                toast.style.transform = 'translate(-50%, 0)';
            }
            toast.style.opacity = '1';
        });

        if (options.duration && options.duration > 0) {
            setTimeout(() => {
                if (options.position === 'top-right' || options.position === 'bottom-right') {
                    toast.style.transform = 'translateX(400px)';
                } else if (options.position === 'top-left' || options.position === 'bottom-left') {
                    toast.style.transform = 'translateX(-400px)';
                } else if (options.position === 'top-center') {
                    toast.style.transform = 'translate(-50%, -100px)';
                } else if (options.position === 'bottom-center') {
                    toast.style.transform = 'translate(-50%, 100px)';
                }
                toast.style.opacity = '0';

                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                }, 300);
            }, options.duration);
        }

        return {
            element: toast,
            unmount: function() {
                if (options.position === 'top-right' || options.position === 'bottom-right') {
                    toast.style.transform = 'translateX(400px)';
                } else if (options.position === 'top-left' || options.position === 'bottom-left') {
                    toast.style.transform = 'translateX(-400px)';
                } else if (options.position === 'top-center') {
                    toast.style.transform = 'translate(-50%, -100px)';
                } else if (options.position === 'bottom-center') {
                    toast.style.transform = 'translate(-50%, 100px)';
                }
                toast.style.opacity = '0';

                setTimeout(() => {
                    if (toast.parentElement) {
                        toast.parentElement.removeChild(toast);
                    }
                }, 300);
            }
        };
    };

    Onigiri.portal.init();

    Onigiri.modules.portal = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
