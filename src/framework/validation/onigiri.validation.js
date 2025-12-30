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
     * Form Validation Module
     */
    Onigiri.validation = {
        rules: {
            required: function(value) {
                return value !== null && value !== undefined && value.toString().trim() !== '';
            },

            email: function(value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },

            url: function(value) {
                try {
                    new URL(value);
                    return true;
                } catch (e) {
                    return false;
                }
            },

            min: function(value, min) {
                return parseFloat(value) >= parseFloat(min);
            },

            max: function(value, max) {
                return parseFloat(value) <= parseFloat(max);
            },

            minLength: function(value, length) {
                return value.toString().length >= parseInt(length);
            },

            maxLength: function(value, length) {
                return value.toString().length <= parseInt(length);
            },

            pattern: function(value, pattern) {
                return new RegExp(pattern).test(value);
            },

            numeric: function(value) {
                return /^[0-9]+$/.test(value);
            },

            alpha: function(value) {
                return /^[a-zA-Z]+$/.test(value);
            },

            alphanumeric: function(value) {
                return /^[a-zA-Z0-9]+$/.test(value);
            }
        },

        messages: {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            url: 'Please enter a valid URL',
            min: 'Value must be at least {0}',
            max: 'Value must be at most {0}',
            minLength: 'Must be at least {0} characters',
            maxLength: 'Must be at most {0} characters',
            pattern: 'Invalid format',
            numeric: 'Must contain only numbers',
            alpha: 'Must contain only letters',
            alphanumeric: 'Must contain only letters and numbers'
        },

        validate: function(form, rules) {
            const errors = {};
            
            Object.keys(rules).forEach(fieldName => {
                const input = form.querySelector(`[name="${fieldName}"]`);
                if (!input) return;
                
                const value = input.value;
                const fieldRules = rules[fieldName];
                
                Object.keys(fieldRules).forEach(ruleName => {
                    const ruleValue = fieldRules[ruleName];
                    const ruleFunc = this.rules[ruleName];
                    
                    if (!ruleFunc) return;
                    
                    let isValid;
                    if (typeof ruleValue === 'boolean' && ruleValue) {
                        isValid = ruleFunc(value);
                    } else {
                        isValid = ruleFunc(value, ruleValue);
                    }
                    
                    if (!isValid) {
                        if (!errors[fieldName]) {
                            errors[fieldName] = [];
                        }
                        
                        let message = this.messages[ruleName] || 'Invalid value';
                        if (ruleValue !== true) {
                            message = message.replace('{0}', ruleValue);
                        }
                        
                        errors[fieldName].push(message);
                    }
                });
            });
            
            return {
                isValid: Object.keys(errors).length === 0,
                errors: errors
            };
        },

        addRule: function(name, func, message) {
            this.rules[name] = func;
            if (message) {
                this.messages[name] = message;
            }
            return this;
        }
    };

    /**
     * Add validation method to Onigiri prototype
     */
    Onigiri.prototype.validate = function(rules) {
        const form = this.elements[0];
        if (!form || form.tagName !== 'FORM') {
            console.error('validate() can only be called on form elements');
            return { isValid: false, errors: {} };
        }
        
        return Onigiri.validation.validate(form, rules);
    };

    Onigiri.modules.validation = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
