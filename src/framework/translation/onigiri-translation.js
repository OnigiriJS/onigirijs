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
     * Translation Module
     */
    Onigiri.i18n = {
        _config: {
            locale: 'en',
            fallbackLocale: 'en',
            storageKey: 'onigiri_locale',
            autoDetect: true,
            missingTranslationWarning: true
        },

        _translations: {},
        _pluralRules: {},

        /**
         * Initialize translation module
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});

            // Auto-detect locale from browser or storage
            if (this._config.autoDetect) {
                const storedLocale = Onigiri.modules.storage ? 
                    Onigiri.storage.get(this._config.storageKey) : null;

                if (storedLocale) {
                    this._config.locale = storedLocale;
                } else if (navigator.language) {
                    this._config.locale = navigator.language.split('-')[0];
                }
            }

            // Initialize plural rules
            this._initPluralRules();

            return this;
        },

        /**
         * Set current locale
         */
        setLocale: function(locale) {
            this._config.locale = locale;

            // Store locale preference if storage module is available
            if (Onigiri.modules.storage) {
                Onigiri.storage.set(this._config.storageKey, locale);
            }

            // Trigger locale change event
            document.dispatchEvent(new CustomEvent('onigiri:locale:changed', {
                detail: { locale: locale }
            }));

            return this;
        },

        /**
         * Get current locale
         */
        getLocale: function() {
            return this._config.locale;
        },

        /**
         * Add translations for a locale
         */
        addTranslations: function(locale, translations, namespace) {
            if (!this._translations[locale]) {
                this._translations[locale] = {};
            }

            if (namespace) {
                if (!this._translations[locale][namespace]) {
                    this._translations[locale][namespace] = {};
                }
                Onigiri.extend(this._translations[locale][namespace], translations);
            } else {
                Onigiri.extend(this._translations[locale], translations);
            }

            return this;
        },

        /**
         * Add translations for multiple locales at once
         */
        addMessages: function(messages) {
            Object.keys(messages).forEach(locale => {
                this.addTranslations(locale, messages[locale]);
            });
            return this;
        },

        /**
         * Translate a key
         */
        t: function(key, params, locale) {
            locale = locale || this._config.locale;

            // Try to get translation
            let translation = this._getTranslation(key, locale);

            // Fallback to fallback locale
            if (translation === null && locale !== this._config.fallbackLocale) {
                translation = this._getTranslation(key, this._config.fallbackLocale);
            }

            // Fallback to key if not found
            if (translation === null) {
                if (this._config.missingTranslationWarning) {
                    console.warn(`OnigiriJS i18n: Missing translation for key "${key}" in locale "${locale}"`);
                }
                return key;
            }

            // Replace parameters
            if (params) {
                translation = this._replaceParams(translation, params);
            }

            return translation;
        },

        /**
         * Translate with plural support
         */
        tc: function(key, count, params, locale) {
            locale = locale || this._config.locale;
            params = params || {};
            params.count = count;

            const pluralKey = this._getPluralKey(locale, count);
            const fullKey = `${key}.${pluralKey}`;

            let translation = this.t(fullKey, params, locale);

            // Fallback to base key if plural not found
            if (translation === fullKey) {
                translation = this.t(key, params, locale);
            }

            return translation;
        },

        /**
         * Check if translation exists
         */
        has: function(key, locale) {
            locale = locale || this._config.locale;
            return this._getTranslation(key, locale) !== null;
        },

        /**
         * Get translation without parameters
         */
        _getTranslation: function(key, locale) {
            if (!this._translations[locale]) {
                return null;
            }

            // Support nested keys like "user.profile.name"
            const keys = key.split('.');
            let value = this._translations[locale];

            for (let i = 0; i < keys.length; i++) {
                if (value && typeof value === 'object' && keys[i] in value) {
                    value = value[keys[i]];
                } else {
                    return null;
                }
            }

            return typeof value === 'string' ? value : null;
        },

        /**
         * Replace parameters in translation
         */
        _replaceParams: function(translation, params) {
            // Named parameters: {name}, {count}
            translation = translation.replace(/\{([^}]+)\}/g, function(match, key) {
                return params.hasOwnProperty(key) ? params[key] : match;
            });

            // Indexed parameters: {0}, {1}
            if (Array.isArray(params)) {
                params.forEach((value, index) => {
                    translation = translation.replace(new RegExp(`\\{${index}\\}`, 'g'), value);
                });
            }

            return translation;
        },

        /**
         * Initialize plural rules for common languages
         */
        _initPluralRules: function() {
            // English, German, etc: one, other
            this._pluralRules.en = this._pluralRules.de = this._pluralRules.es = 
            this._pluralRules.fr = this._pluralRules.it = function(n) {
                return n === 1 ? 'one' : 'other';
            };

            // Slavic languages (Russian, Ukrainian, etc): one, few, many, other
            this._pluralRules.ru = this._pluralRules.uk = function(n) {
                if (n % 10 === 1 && n % 100 !== 11) return 'one';
                if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
                return 'many';
            };

            // Polish
            this._pluralRules.pl = function(n) {
                if (n === 1) return 'one';
                if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
                return 'many';
            };

            // Japanese, Chinese, Korean: other only
            this._pluralRules.ja = this._pluralRules.zh = this._pluralRules.ko = function(n) {
                return 'other';
            };

            // Arabic
            this._pluralRules.ar = function(n) {
                if (n === 0) return 'zero';
                if (n === 1) return 'one';
                if (n === 2) return 'two';
                if (n % 100 >= 3 && n % 100 <= 10) return 'few';
                if (n % 100 >= 11) return 'many';
                return 'other';
            };
        },

        /**
         * Get plural form key
         */
        _getPluralKey: function(locale, count) {
            const baseLocale = locale.split('-')[0];
            const rule = this._pluralRules[baseLocale];

            if (rule) {
                return rule(count);
            }

            // Default English rule
            return count === 1 ? 'one' : 'other';
        },

        /**
         * Format date according to locale
         */
        formatDate: function(date, format, locale) {
            locale = locale || this._config.locale;

            if (!(date instanceof Date)) {
                date = new Date(date);
            }

            const options = this._getDateFormatOptions(format);

            try {
                return new Intl.DateTimeFormat(locale, options).format(date);
            } catch (e) {
                console.error('OnigiriJS i18n: Date formatting error', e);
                return date.toString();
            }
        },

        /**
         * Get date format options
         */
        _getDateFormatOptions: function(format) {
            const formats = {
                short: { dateStyle: 'short' },
                medium: { dateStyle: 'medium' },
                long: { dateStyle: 'long' },
                full: { dateStyle: 'full' },
                time: { timeStyle: 'short' },
                datetime: { dateStyle: 'medium', timeStyle: 'short' }
            };

            return formats[format] || { dateStyle: 'medium' };
        },

        /**
         * Format number according to locale
         */
        formatNumber: function(number, options, locale) {
            locale = locale || this._config.locale;
            options = options || {};

            try {
                return new Intl.NumberFormat(locale, options).format(number);
            } catch (e) {
                console.error('OnigiriJS i18n: Number formatting error', e);
                return number.toString();
            }
        },

        /**
         * Format currency
         */
        formatCurrency: function(amount, currency, locale) {
            locale = locale || this._config.locale;

            return this.formatNumber(amount, {
                style: 'currency',
                currency: currency || 'USD'
            }, locale);
        },

        /**
         * Get available locales
         */
        getLocales: function() {
            return Object.keys(this._translations);
        },

        /**
         * Get all translations for current locale
         */
        getTranslations: function(locale) {
            locale = locale || this._config.locale;
            return this._translations[locale] || {};
        }
    };

    /**
     * Add shorthand methods to Onigiri
     */
    Onigiri.t = function(key, params, locale) {
        return Onigiri.i18n.t(key, params, locale);
    };

    Onigiri.tc = function(key, count, params, locale) {
        return Onigiri.i18n.tc(key, count, params, locale);
    };

    /**
     * DOM translation helpers
     */
    Onigiri.prototype.translate = function() {
        this.each(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const translation = Onigiri.i18n.t(key);

                // Handle different element types
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.placeholder = translation;
                    } else {
                        el.value = translation;
                    }
                } else {
                    el.textContent = translation;
                }
            }

            // Translate attributes
            ['title', 'alt', 'placeholder'].forEach(attr => {
                const attrKey = el.getAttribute(`data-i18n-${attr}`);
                if (attrKey) {
                    el.setAttribute(attr, Onigiri.i18n.t(attrKey));
                }
            });
        });
        return this;
    };

    /**
     * Auto-translate all elements with data-i18n
     */
    Onigiri.i18n.translatePage = function() {
        new Onigiri('[data-i18n]').translate();
        return this;
    };

    /**
     * Watch for locale changes and auto-translate
     */
    document.addEventListener('onigiri:locale:changed', function() {
        Onigiri.i18n.translatePage();
    });

    Onigiri.modules.translation = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
