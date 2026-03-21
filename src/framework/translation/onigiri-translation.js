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
        },

        /**
         * Export translations to JSON format
         */
        exportJSON: function(locale, namespace) {
            locale = locale || this._config.locale;
            const translations = namespace ? 
                this._translations[locale]?.[namespace] : 
                this._translations[locale];

            if (!translations) {
                console.warn(`OnigiriJS i18n: No translations found for locale "${locale}"${namespace ? ` and namespace "${namespace}"` : ''}`);
                return null;
            }

            return JSON.stringify(translations, null, 2);
        },

        /**
         * Export translations to PHP format
         */
        exportPHP: function(locale, namespace) {
            locale = locale || this._config.locale;
            const translations = namespace ? 
                this._translations[locale]?.[namespace] : 
                this._translations[locale];

            if (!translations) {
                console.warn(`OnigiriJS i18n: No translations found for locale "${locale}"${namespace ? ` and namespace "${namespace}"` : ''}`);
                return null;
            }

            return this._generatePHPArray(translations);
        },

        /**
         * Generate PHP array syntax from object
         */
        _generatePHPArray: function(obj, indent) {
            indent = indent || 0;
            const spaces = '    '.repeat(indent);
            const innerSpaces = '    '.repeat(indent + 1);
            
            let php = '[\n';
            
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const phpKey = `'${key.replace(/'/g, "\\'")}'`;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    php += `${innerSpaces}${phpKey} => ${this._generatePHPArray(value, indent + 1)},\n`;
                } else if (typeof value === 'string') {
                    const phpValue = `'${value.replace(/'/g, "\\'").replace(/\n/g, "\\n")}'`;
                    php += `${innerSpaces}${phpKey} => ${phpValue},\n`;
                } else {
                    php += `${innerSpaces}${phpKey} => ${value},\n`;
                }
            });
            
            php += `${spaces}]`;
            return php;
        },

        /**
         * Import translations from JSON
         */
        importJSON: function(jsonString, locale, namespace) {
            try {
                const translations = JSON.parse(jsonString);
                this.addTranslations(locale, translations, namespace);
                return true;
            } catch (e) {
                console.error('OnigiriJS i18n: Failed to import JSON translations', e);
                return false;
            }
        },

        /**
         * Import translations from PHP array string
         */
        importPHP: function(phpString, locale, namespace) {
            try {
                // Extract the array content from PHP string
                const arrayMatch = phpString.match(/\[[\s\S]*\]/);
                if (!arrayMatch) {
                    throw new Error('Invalid PHP array format');
                }

                // Convert PHP array to JSON-compatible string
                let jsonString = arrayMatch[0]
                    .replace(/=>/g, ':')
                    .replace(/'/g, '"');

                const translations = JSON.parse(jsonString);
                this.addTranslations(locale, translations, namespace);
                return true;
            } catch (e) {
                console.error('OnigiriJS i18n: Failed to import PHP translations', e);
                return false;
            }
        },

        /**
         * Download translation file
         */
        downloadTranslation: function(locale, label, format) {
            locale = locale || this._config.locale;
            label = label || 'messages';
            format = format || 'json';

            const namespace = label !== 'messages' ? label : null;
            let content, mimeType, extension;

            if (format === 'json') {
                content = this.exportJSON(locale, namespace);
                mimeType = 'application/json';
                extension = 'json';
            } else if (format === 'php') {
                content = this.exportPHP(locale, namespace);
                if (content) {
                    content = `<?php\n\nreturn ${content};\n`;
                }
                mimeType = 'application/x-php';
                extension = 'php';
            } else {
                console.error('OnigiriJS i18n: Unsupported format. Use "json" or "php".');
                return false;
            }

            if (!content) {
                return false;
            }

            // Create download
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const filename = `${label}.${extension}`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(`OnigiriJS i18n: Downloaded translation/${locale}/${filename}`);
            return true;
        },

        /**
         * Load translation file from URL
         */
        loadTranslation: function(url, locale, namespace) {
            return fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(content => {
                    const format = url.endsWith('.php') ? 'php' : 'json';
                    
                    if (format === 'php') {
                        return this.importPHP(content, locale, namespace);
                    } else {
                        return this.importJSON(content, locale, namespace);
                    }
                })
                .then(success => {
                    if (success) {
                        console.log(`OnigiriJS i18n: Loaded translations from ${url}`);
                        document.dispatchEvent(new CustomEvent('onigiri:translations:loaded', {
                            detail: { url, locale, namespace }
                        }));
                    }
                    return success;
                })
                .catch(error => {
                    console.error(`OnigiriJS i18n: Failed to load translations from ${url}`, error);
                    return false;
                });
        },

        /**
         * Load translations with the /translation/{language}/{label}.{format} structure
         */
        loadFromPath: function(basePath, locale, label, format) {
            basePath = basePath || '/translation';
            locale = locale || this._config.locale;
            label = label || 'messages';
            format = format || 'json';

            const url = `${basePath}/${locale}/${label}.${format}`;
            const namespace = label !== 'messages' ? label : null;

            return this.loadTranslation(url, locale, namespace);
        },

        /**
         * Batch load multiple translation files
         */
        loadMultiple: function(basePath, locale, labels, format) {
            locale = locale || this._config.locale;
            labels = labels || ['messages'];
            format = format || 'json';

            const promises = labels.map(label => 
                this.loadFromPath(basePath, locale, label, format)
            );

            return Promise.all(promises)
                .then(results => {
                    const successful = results.filter(r => r).length;
                    console.log(`OnigiriJS i18n: Loaded ${successful}/${results.length} translation files`);
                    return results;
                });
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
