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
     * HumHub Integration Hook
     */
    Onigiri.humhub = function(moduleName, config) {
        if (typeof humhub !== 'undefined' && humhub.module) {
            return humhub.module(moduleName, function(module, require, $) {
                const component = new Onigiri.prototype.Component(config);
                
                module.exports = component;
                
                if (config.autoInit !== false) {
                    $(document).ready(function() {
                        if (config.selector) {
                            component.mount(config.selector);
                        }
                    });
                }
                
                if (config.pjax !== false) {
                    $(document).on('humhub:ready pjax:success', function() {
                        if (config.selector && document.querySelector(config.selector)) {
                            component.mount(config.selector);
                        }
                    });
                }
                
                return component;
            });
        } else {
            console.warn('HumHub not detected. Component created without HumHub integration.');
            return new Onigiri.prototype.Component(config);
        }
    };

    Onigiri.modules.humhub = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
