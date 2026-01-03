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
        throw new Error('OnigiriJS core not found. Load onigiri-core.js first.');
    }

    /**
     * Easing Functions
     */
    const Easing = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    };

    /**
     * Animation Helper
     */
    function animate(element, options) {
        const {
            duration = 300,
            easing = 'easeOutQuad',
            onProgress,
            onComplete
        } = options;

        const easingFunc = Easing[easing] || Easing.linear;
        let start = null;

        const step = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easingFunc(progress);

            if (onProgress) {
                onProgress(easedProgress, progress);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (onComplete) {
                onComplete();
            }
        };

        requestAnimationFrame(step);
    }

    /**
     * Fade In Animation
     */
    Onigiri.prototype.fadeIn = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const originalDisplay = el.style.display;
            const computedDisplay = window.getComputedStyle(el).display;

            el.style.opacity = '0';
            el.style.display = originalDisplay === 'none' || !originalDisplay ? 
                (computedDisplay === 'none' ? 'block' : computedDisplay) : originalDisplay;

            animate(el, {
                duration,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    el.style.opacity = easedProgress;
                },
                onComplete: () => {
                    el.style.opacity = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Fade Out Animation
     */
    Onigiri.prototype.fadeOut = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const initialOpacity = parseFloat(window.getComputedStyle(el).opacity) || 1;

            animate(el, {
                duration,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    el.style.opacity = initialOpacity * (1 - easedProgress);
                },
                onComplete: () => {
                    el.style.display = 'none';
                    el.style.opacity = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Fade To (fade to specific opacity)
     */
    Onigiri.prototype.fadeTo = function(targetOpacity, duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const initialOpacity = parseFloat(window.getComputedStyle(el).opacity) || 1;
            const diff = targetOpacity - initialOpacity;

            animate(el, {
                duration,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    el.style.opacity = initialOpacity + (diff * easedProgress);
                },
                onComplete: () => {
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Slide Down Animation
     */
    Onigiri.prototype.slideDown = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            el.style.display = 'block';
            el.style.overflow = 'hidden';

            const height = el.scrollHeight;

            el.style.height = '0';

            el.offsetHeight;

            animate(el, {
                duration,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    el.style.height = (height * easedProgress) + 'px';
                },
                onComplete: () => {
                    el.style.height = '';
                    el.style.overflow = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Slide Up Animation
     */
    Onigiri.prototype.slideUp = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const height = el.scrollHeight;

            el.style.height = height + 'px';
            el.style.overflow = 'hidden';

            el.offsetHeight;

            animate(el, {
                duration,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    el.style.height = (height * (1 - easedProgress)) + 'px';
                },
                onComplete: () => {
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Slide Toggle Animation
     */
    Onigiri.prototype.slideToggle = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const isVisible = window.getComputedStyle(el).display !== 'none';
            if (isVisible) {
                Onigiri.prototype.slideUp.call({ elements: [el], each: Onigiri.prototype.each }, duration, callback);
            } else {
                Onigiri.prototype.slideDown.call({ elements: [el], each: Onigiri.prototype.each }, duration, callback);
            }
        });

        return this;
    };

    /**
     * Fade Toggle Animation
     */
    Onigiri.prototype.fadeToggle = function(duration, callback) {
        duration = duration || 300;

        this.each(el => {
            const isVisible = window.getComputedStyle(el).display !== 'none';
            if (isVisible) {
                Onigiri.prototype.fadeOut.call({ elements: [el], each: Onigiri.prototype.each }, duration, callback);
            } else {
                Onigiri.prototype.fadeIn.call({ elements: [el], each: Onigiri.prototype.each }, duration, callback);
            }
        });

        return this;
    };

    /**
     * Custom Animation (animate any CSS property)
     */
    Onigiri.prototype.animate = function(properties, duration, easing, callback) {
        if (typeof duration === 'function') {
            callback = duration;
            duration = 300;
            easing = 'easeOutQuad';
        } else if (typeof easing === 'function') {
            callback = easing;
            easing = 'easeOutQuad';
        }

        duration = duration || 300;
        easing = easing || 'easeOutQuad';

        this.each(el => {
            const startValues = {};
            const endValues = {};
            const units = {};

            Object.keys(properties).forEach(prop => {
                const currentStyle = window.getComputedStyle(el);
                const currentValue = currentStyle[prop];
                const targetValue = properties[prop];

                const currentMatch = String(currentValue).match(/^([+-]?\d*\.?\d+)([a-z%]*)$/i);
                const targetMatch = String(targetValue).match(/^([+-]?\d*\.?\d+)([a-z%]*)$/i);

                if (currentMatch && targetMatch) {
                    startValues[prop] = parseFloat(currentMatch[1]);
                    endValues[prop] = parseFloat(targetMatch[1]);
                    units[prop] = targetMatch[2] || currentMatch[2] || '';
                }
            });

            animate(el, {
                duration,
                easing,
                onProgress: (easedProgress) => {
                    Object.keys(startValues).forEach(prop => {
                        const start = startValues[prop];
                        const end = endValues[prop];
                        const current = start + (end - start) * easedProgress;
                        el.style[prop] = current + units[prop];
                    });
                },
                onComplete: () => {
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Stop all animations on element
     */
    Onigiri.prototype.stop = function(jumpToEnd) {
        this.each(el => {
            if (jumpToEnd) {
                el.style.height = '';
                el.style.overflow = '';
                el.style.opacity = '';
            }
        });

        return this;
    };

    /**
     * Delay function
     */
    Onigiri.prototype.delay = function(duration, callback) {
        duration = duration || 0;

        setTimeout(() => {
            if (callback) {
                this.each(el => callback.call(el));
            }
        }, duration);

        return this;
    };

    Onigiri.easing = Easing;

    Onigiri.modules.animate = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
