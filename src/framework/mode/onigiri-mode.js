(function(Onigiri) {
    'use strict';

    if (!Onigiri) {
        throw new Error('OnigiriJS core not found. Load onigiri.core.js first.');
    }

    /**
     * Theme Mode Module - Light/Dark mode management
     */
    Onigiri.mode = {
        _config: {
            storageKey: 'onigiri_theme_mode',
            defaultMode: 'light',
            autoDetect: true,
            syncWithSystem: true,
            attribute: 'data-theme',
            classPrefix: 'theme-',
            transitions: true,
            transitionDuration: 300,

            selectors: {
                root: 'html',
                containers: '[data-theme-container]',
                toggle: '[data-theme-toggle]',
                indicators: '[data-theme-indicator]'
            },

            classes: {
                light: {
                    bg: 'bg-white',
                    text: 'text-gray-900',
                    border: 'border-gray-200',
                    card: 'bg-gray-50'
                },
                dark: {
                    bg: 'bg-gray-900',
                    text: 'text-gray-100',
                    border: 'border-gray-700',
                    card: 'bg-gray-800'
                }
            },

            themes: {
                light: {},
                dark: {}
            }
        },

        _currentMode: null,
        _mediaQuery: null,
        _observers: [],

        /**
         * Initialize theme mode system
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});

            this._currentMode = this._loadMode();

            if (this._config.syncWithSystem) {
                this._setupSystemSync();
            }

            this.set(this._currentMode, false);

            this._setupObservers();

            this._bindToggles();

            document.dispatchEvent(new CustomEvent('onigiri:mode:ready', {
                detail: { mode: this._currentMode }
            }));

            return this;
        },

        /**
         * Get current mode
         */
        get: function() {
            return this._currentMode;
        },

        /**
         * Set theme mode
         */
        set: function(mode, save = true) {
            if (!mode || (mode !== 'light' && mode !== 'dark')) {
                mode = this._config.defaultMode;
            }

            const oldMode = this._currentMode;
            this._currentMode = mode;

            if (this._config.transitions) {
                this._enableTransitions();
            }

            this._applyToElement(
                document.querySelector(this._config.selectors.root),
                mode
            );

            this._applyToContainers(mode);

            this._updateToggles(mode);

            this._updateIndicators(mode);

            if (save && Onigiri.modules.storage) {
                Onigiri.storage.set(this._config.storageKey, mode);
            }

            if (this._config.transitions) {
                setTimeout(() => {
                    this._disableTransitions();
                }, this._config.transitionDuration);
            }

            document.dispatchEvent(new CustomEvent('onigiri:mode:change', {
                detail: { 
                    mode: mode, 
                    oldMode: oldMode 
                }
            }));

            return this;
        },

        /**
         * Toggle between light and dark
         */
        toggle: function() {
            const newMode = this._currentMode === 'light' ? 'dark' : 'light';
            return this.set(newMode);
        },

        /**
         * Check if current mode is dark
         */
        isDark: function() {
            return this._currentMode === 'dark';
        },

        /**
         * Check if current mode is light
         */
        isLight: function() {
            return this._currentMode === 'light';
        },

        /**
         * Add custom theme
         */
        addTheme: function(name, definition) {
            this._config.themes[name] = definition;
            return this;
        },

        /**
         * Register class mappings for auto-detection
         */
        registerClasses: function(mode, classes) {
            Onigiri.extend(this._config.classes[mode], classes);
            return this;
        },

        /**
         * Apply mode to specific element
         */
        applyTo: function(element, mode) {
            mode = mode || this._currentMode;

            if (typeof element === 'string') {
                element = document.querySelector(element);
            }

            if (element) {
                this._applyToElement(element, mode);
            }

            return this;
        },

        /**
         * Load mode from storage or system
         */
        _loadMode: function() {
            if (Onigiri.modules.storage) {
                const stored = Onigiri.storage.get(this._config.storageKey);
                if (stored) return stored;
            }

            if (this._config.autoDetect && window.matchMedia) {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    return 'dark';
                }
            }

            return this._config.defaultMode;
        },

        /**
         * Setup system theme synchronization
         */
        _setupSystemSync: function() {
            if (!window.matchMedia) return;

            this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handler = (e) => {
                if (!Onigiri.modules.storage || 
                    !Onigiri.storage.has(this._config.storageKey)) {
                    this.set(e.matches ? 'dark' : 'light', false);
                }
            };

            if (this._mediaQuery.addEventListener) {
                this._mediaQuery.addEventListener('change', handler);
            } else {
                this._mediaQuery.addListener(handler);
            }
        },

        /**
         * Apply theme to element
         */
        _applyToElement: function(el, mode) {
            if (!el) return;

            el.setAttribute(this._config.attribute, mode);

            el.classList.remove(this._config.classPrefix + 'light');
            el.classList.remove(this._config.classPrefix + 'dark');
            el.classList.add(this._config.classPrefix + mode);

            if (el.tagName === 'HTML' || el.tagName === 'BODY') {
                el.classList.remove('light-mode', 'dark-mode');
                el.classList.add(mode + '-mode');
            }

            this._swapClasses(el, mode);

            if (this._config.themes[mode]) {
                this._applyCustomTheme(el, this._config.themes[mode]);
            }
        },

        /**
         * Apply to all theme containers
         */
        _applyToContainers: function(mode) {
            const containers = document.querySelectorAll(
                this._config.selectors.containers
            );

            containers.forEach(el => {
                this._applyToElement(el, mode);
            });
        },

        /**
         * Swap classes based on mode
         */
        _swapClasses: function(el, mode) {
            const oppositeMode = mode === 'light' ? 'dark' : 'light';
            const addClasses = this._config.classes[mode];
            const removeClasses = this._config.classes[oppositeMode];

            Object.values(removeClasses).forEach(className => {
                if (el.classList.contains(className)) {
                    el.classList.remove(className);
                }
            });

            Object.values(addClasses).forEach(className => {
                if (!el.classList.contains(className)) {
                    el.classList.add(className);
                }
            });

            this._processChildElements(el, mode);
        },

        /**
         * Process child elements for class swapping
         */
        _processChildElements: function(parent, mode) {
            const elements = parent.querySelectorAll('[class*="bg-"], [class*="text-"], [class*="border-"]');

            elements.forEach(el => {
                this._swapElementClasses(el, mode);
            });
        },

        /**
         * Swap classes for individual element
         */
        _swapElementClasses: function(el, mode) {
            const classList = Array.from(el.classList);
            const oppositeMode = mode === 'light' ? 'dark' : 'light';

            classList.forEach(className => {
                if (this._shouldSwapClass(className, oppositeMode)) {
                    const newClass = this._getSwappedClass(className, mode);
                    if (newClass && newClass !== className) {
                        el.classList.remove(className);
                        el.classList.add(newClass);
                    }
                }
            });
        },

        /**
         * Check if class should be swapped
         */
        _shouldSwapClass: function(className, currentMode) {
            const patterns = [
                /^bg-(white|black|gray-[0-9]+)$/,
                /^text-(white|black|gray-[0-9]+)$/,
                /^border-(white|black|gray-[0-9]+)$/
            ];

            return patterns.some(pattern => pattern.test(className));
        },

        /**
         * Get swapped class for mode
         */
        _getSwappedClass: function(className, targetMode) {
            const mappings = {
                light: {
                    'bg-gray-900': 'bg-white',
                    'bg-gray-800': 'bg-gray-50',
                    'bg-gray-700': 'bg-gray-100',
                    'text-gray-100': 'text-gray-900',
                    'text-gray-200': 'text-gray-800',
                    'text-white': 'text-gray-900',
                    'border-gray-700': 'border-gray-200',
                    'border-gray-600': 'border-gray-300'
                },
                dark: {
                    'bg-white': 'bg-gray-900',
                    'bg-gray-50': 'bg-gray-800',
                    'bg-gray-100': 'bg-gray-700',
                    'text-gray-900': 'text-gray-100',
                    'text-gray-800': 'text-gray-200',
                    'text-black': 'text-white',
                    'border-gray-200': 'border-gray-700',
                    'border-gray-300': 'border-gray-600'
                }
            };

            return mappings[targetMode][className] || null;
        },

        /**
         * Apply custom theme styles
         */
        _applyCustomTheme: function(el, theme) {
            Object.keys(theme).forEach(property => {
                el.style.setProperty(`--theme-${property}`, theme[property]);
            });
        },

        /**
         * Bind toggle buttons
         */
        _bindToggles: function() {
            const toggles = document.querySelectorAll(this._config.selectors.toggle);

            toggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggle();
                });
            });
        },

        /**
         * Update toggle button states
         */
        _updateToggles: function(mode) {
            const toggles = document.querySelectorAll(this._config.selectors.toggle);

            toggles.forEach(toggle => {
                toggle.setAttribute('data-current-theme', mode);

                toggle.setAttribute('aria-label', 
                    `Switch to ${mode === 'light' ? 'dark' : 'light'} mode`
                );
            });
        },

        /**
         * Update theme indicators
         */
        _updateIndicators: function(mode) {
            const indicators = document.querySelectorAll(
                this._config.selectors.indicators
            );

            indicators.forEach(indicator => {
                indicator.textContent = mode;
                indicator.setAttribute('data-theme', mode);
            });
        },

        /**
         * Setup mutation observers for dynamic content
         */
        _setupObservers: function() {
            if (!window.MutationObserver) return;

            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches && node.matches(this._config.selectors.containers)) {
                                this._applyToElement(node, this._currentMode);
                            }

                            if (node.matches && node.matches(this._config.selectors.toggle)) {
                                node.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    this.toggle();
                                });
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            this._observers.push(observer);
        },

        /**
         * Enable transitions
         */
        _enableTransitions: function() {
            const root = document.querySelector(this._config.selectors.root);
            if (root) {
                root.style.setProperty('--theme-transition', `all ${this._config.transitionDuration}ms ease-in-out`);
                root.classList.add('theme-transitioning');
            }
        },

        /**
         * Disable transitions
         */
        _disableTransitions: function() {
            const root = document.querySelector(this._config.selectors.root);
            if (root) {
                root.style.removeProperty('--theme-transition');
                root.classList.remove('theme-transitioning');
            }
        },

        /**
         * Cleanup
         */
        destroy: function() {
            this._observers.forEach(observer => observer.disconnect());
            this._observers = [];

            if (this._mediaQuery && this._mediaQuery.removeEventListener) {
                this._mediaQuery.removeEventListener('change', () => {});
            }
        }
    };

    /**
     * Add mode methods to Onigiri prototype
     */
    Onigiri.prototype.theme = function(mode) {
        if (mode) {
            this.each(el => Onigiri.mode.applyTo(el, mode));
        }
        return this;
    };

    Onigiri.modules.mode = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
