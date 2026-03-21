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
     * Easing Functions Library
     */
    const Easing = {
        // Linear
        linear: t => t,

        // Quadratic
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

        // Cubic
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

        // Quartic
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

        // Quintic
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

        // Sinusoidal
        easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
        easeOutSine: t => Math.sin(t * Math.PI / 2),
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

        // Exponential
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => {
            if (t === 0 || t === 1) return t;
            return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
        },

        // Circular
        easeInCirc: t => 1 - Math.sqrt(1 - t * t),
        easeOutCirc: t => Math.sqrt(1 - (--t) * t),
        easeInOutCirc: t => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,

        // Elastic
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeInOutElastic: t => {
            const c5 = (2 * Math.PI) / 4.5;
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        },

        // Back
        easeInBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return c3 * t * t * t - c1 * t * t;
        },
        easeOutBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        },
        easeInOutBack: t => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        },

        // Bounce
        easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        easeInOutBounce: t => t < 0.5
            ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
            : (1 + Easing.easeOutBounce(2 * t - 1)) / 2
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
    Onigiri.prototype.fadeIn = function(duration, easing, callback) {
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
            const originalDisplay = el.style.display;
            const computedDisplay = window.getComputedStyle(el).display;

            el.style.opacity = '0';
            el.style.display = originalDisplay === 'none' || !originalDisplay ? 
                (computedDisplay === 'none' ? 'block' : computedDisplay) : originalDisplay;

            animate(el, {
                duration,
                easing,
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
    Onigiri.prototype.fadeOut = function(duration, easing, callback) {
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
            const initialOpacity = parseFloat(window.getComputedStyle(el).opacity) || 1;

            animate(el, {
                duration,
                easing,
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
    Onigiri.prototype.fadeTo = function(targetOpacity, duration, easing, callback) {
        if (typeof easing === 'function') {
            callback = easing;
            easing = 'easeOutQuad';
        }

        duration = duration || 300;
        easing = easing || 'easeOutQuad';

        this.each(el => {
            const initialOpacity = parseFloat(window.getComputedStyle(el).opacity) || 1;
            const diff = targetOpacity - initialOpacity;

            animate(el, {
                duration,
                easing,
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
    Onigiri.prototype.slideDown = function(duration, easing, callback) {
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
            el.style.display = 'block';
            el.style.overflow = 'hidden';
            const height = el.scrollHeight;
            el.style.height = '0';
            el.offsetHeight;

            animate(el, {
                duration,
                easing,
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
    Onigiri.prototype.slideUp = function(duration, easing, callback) {
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
            const height = el.scrollHeight;
            el.style.height = height + 'px';
            el.style.overflow = 'hidden';
            el.offsetHeight;

            animate(el, {
                duration,
                easing,
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
    Onigiri.prototype.slideToggle = function(duration, easing, callback) {
        if (typeof duration === 'function') {
            callback = duration;
            duration = 300;
            easing = 'easeOutQuad';
        } else if (typeof easing === 'function') {
            callback = easing;
            easing = 'easeOutQuad';
        }

        this.each(el => {
            const isVisible = window.getComputedStyle(el).display !== 'none';
            const wrappedEl = new Onigiri(el);
            if (isVisible) {
                wrappedEl.slideUp(duration, easing, callback);
            } else {
                wrappedEl.slideDown(duration, easing, callback);
            }
        });

        return this;
    };

    /**
     * Fade Toggle Animation
     */
    Onigiri.prototype.fadeToggle = function(duration, easing, callback) {
        if (typeof duration === 'function') {
            callback = duration;
            duration = 300;
            easing = 'easeOutQuad';
        } else if (typeof easing === 'function') {
            callback = easing;
            easing = 'easeOutQuad';
        }

        this.each(el => {
            const isVisible = window.getComputedStyle(el).display !== 'none';
            const wrappedEl = new Onigiri(el);
            if (isVisible) {
                wrappedEl.fadeOut(duration, easing, callback);
            } else {
                wrappedEl.fadeIn(duration, easing, callback);
            }
        });

        return this;
    };

    /**
     * Slide Left Animation
     */
    Onigiri.prototype.slideLeft = function(duration, easing, callback) {
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
            const width = el.offsetWidth;
            el.style.overflow = 'hidden';
            el.style.whiteSpace = 'nowrap';

            animate(el, {
                duration,
                easing,
                onProgress: (easedProgress) => {
                    el.style.width = (width * (1 - easedProgress)) + 'px';
                },
                onComplete: () => {
                    el.style.display = 'none';
                    el.style.width = '';
                    el.style.overflow = '';
                    el.style.whiteSpace = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Slide Right Animation
     */
    Onigiri.prototype.slideRight = function(duration, easing, callback) {
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
            el.style.display = 'block';
            el.style.overflow = 'hidden';
            el.style.whiteSpace = 'nowrap';
            const width = el.scrollWidth;
            el.style.width = '0';
            el.offsetHeight;

            animate(el, {
                duration,
                easing,
                onProgress: (easedProgress) => {
                    el.style.width = (width * easedProgress) + 'px';
                },
                onComplete: () => {
                    el.style.width = '';
                    el.style.overflow = '';
                    el.style.whiteSpace = '';
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Scale Animation
     */
    Onigiri.prototype.scale = function(scaleValue, duration, easing, callback) {
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
            animate(el, {
                duration,
                easing,
                onProgress: (easedProgress) => {
                    const currentScale = 1 + (scaleValue - 1) * easedProgress;
                    el.style.transform = `scale(${currentScale})`;
                },
                onComplete: () => {
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Rotate Animation
     */
    Onigiri.prototype.rotate = function(degrees, duration, easing, callback) {
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
            animate(el, {
                duration,
                easing,
                onProgress: (easedProgress) => {
                    const currentDegrees = degrees * easedProgress;
                    el.style.transform = `rotate(${currentDegrees}deg)`;
                },
                onComplete: () => {
                    if (callback) callback.call(el);
                }
            });
        });

        return this;
    };

    /**
     * Shake Animation
     */
    Onigiri.prototype.shake = function(duration, callback) {
        duration = duration || 500;

        this.each(el => {
            const originalTransform = el.style.transform;
            let startTime = null;

            const shakeStep = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                    const intensity = 10 * (1 - progress);
                    const x = Math.sin(elapsed * 0.05) * intensity;
                    el.style.transform = `translateX(${x}px)`;
                    requestAnimationFrame(shakeStep);
                } else {
                    el.style.transform = originalTransform;
                    if (callback) callback.call(el);
                }
            };

            requestAnimationFrame(shakeStep);
        });

        return this;
    };

    /**
     * Pulse Animation
     */
    Onigiri.prototype.pulse = function(duration, callback) {
        duration = duration || 600;

        this.each(el => {
            const originalTransform = el.style.transform;

            animate(el, {
                duration: duration / 2,
                easing: 'easeOutQuad',
                onProgress: (easedProgress) => {
                    const scale = 1 + 0.1 * easedProgress;
                    el.style.transform = `scale(${scale})`;
                },
                onComplete: () => {
                    animate(el, {
                        duration: duration / 2,
                        easing: 'easeOutQuad',
                        onProgress: (easedProgress) => {
                            const scale = 1.1 - 0.1 * easedProgress;
                            el.style.transform = `scale(${scale})`;
                        },
                        onComplete: () => {
                            el.style.transform = originalTransform;
                            if (callback) callback.call(el);
                        }
                    });
                }
            });
        });

        return this;
    };

    /**
     * Bounce Animation
     */
    Onigiri.prototype.bounce = function(duration, callback) {
        duration = duration || 600;

        this.each(el => {
            const originalTransform = el.style.transform;

            animate(el, {
                duration,
                easing: 'easeOutBounce',
                onProgress: (easedProgress) => {
                    const translateY = -30 * (1 - easedProgress);
                    el.style.transform = `translateY(${translateY}px)`;
                },
                onComplete: () => {
                    el.style.transform = originalTransform;
                    if (callback) callback.call(el);
                }
            });
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
                el.style.width = '';
                el.style.overflow = '';
                el.style.opacity = '';
                el.style.transform = '';
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
