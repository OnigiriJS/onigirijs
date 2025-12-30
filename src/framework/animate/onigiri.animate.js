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
     * Animation Module
     */
    Onigiri.prototype.fadeIn = function(duration, callback) {
        duration = duration || 300;
        
        this.each(el => {
            el.style.opacity = '0';
            el.style.display = '';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                el.style.opacity = Math.min(progress, 1);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else if (callback) {
                    callback.call(el);
                }
            };
            
            requestAnimationFrame(animate);
        });
        
        return this;
    };

    Onigiri.prototype.fadeOut = function(duration, callback) {
        duration = duration || 300;
        
        this.each(el => {
            let start = null;
            const initialOpacity = parseFloat(window.getComputedStyle(el).opacity) || 1;
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                el.style.opacity = initialOpacity * (1 - Math.min(progress, 1));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.display = 'none';
                    if (callback) callback.call(el);
                }
            };
            
            requestAnimationFrame(animate);
        });
        
        return this;
    };

    Onigiri.prototype.slideDown = function(duration, callback) {
        duration = duration || 300;
        
        this.each(el => {
            el.style.display = '';
            const height = el.scrollHeight;
            el.style.height = '0';
            el.style.overflow = 'hidden';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                el.style.height = (height * Math.min(progress, 1)) + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.height = '';
                    el.style.overflow = '';
                    if (callback) callback.call(el);
                }
            };
            
            requestAnimationFrame(animate);
        });
        
        return this;
    };

    Onigiri.prototype.slideUp = function(duration, callback) {
        duration = duration || 300;
        
        this.each(el => {
            const height = el.scrollHeight;
            el.style.height = height + 'px';
            el.style.overflow = 'hidden';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                
                el.style.height = (height * (1 - Math.min(progress, 1))) + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = '';
                    if (callback) callback.call(el);
                }
            };
            
            requestAnimationFrame(animate);
        });
        
        return this;
    };

    Onigiri.modules.animate = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
