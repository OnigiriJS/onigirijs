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
