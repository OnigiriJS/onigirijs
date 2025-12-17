(function(Onigiri) {
    'use strict';

    if (!Onigiri) {
        throw new Error('OnigiriJS core not found. Load onigiri.core.js first.');
    }

    /**
     * Advanced Object Prototyping System
     */
    Onigiri.prototype.Component = function(config) {
        const component = Object.create(new Onigiri.prototype.EventEmitter());
        
        component._data = config.data || {};
        component._methods = config.methods || {};
        component._computed = config.computed || {};
        component._watchers = config.watchers || {};
        component._hooks = {
            beforeCreate: config.beforeCreate,
            created: config.created,
            beforeMount: config.beforeMount,
            mounted: config.mounted,
            beforeUpdate: config.beforeUpdate,
            updated: config.updated,
            beforeDestroy: config.beforeDestroy,
            destroyed: config.destroyed
        };

        if (component._hooks.beforeCreate) {
            component._hooks.beforeCreate.call(component);
        }

        // Create reactive data properties
        Object.keys(component._data).forEach(key => {
            let value = component._data[key];
            
            Object.defineProperty(component, key, {
                get: function() {
                    return value;
                },
                set: function(newValue) {
                    const oldValue = value;
                    value = newValue;
                    
                    if (component._watchers[key]) {
                        component._watchers[key].call(component, newValue, oldValue);
                    }
                    
                    component.emit('change:' + key, newValue, oldValue);
                    component.emit('update', key, newValue, oldValue);
                    
                    if (component._hooks.beforeUpdate) {
                        component._hooks.beforeUpdate.call(component);
                    }
                    if (component._hooks.updated) {
                        component._hooks.updated.call(component);
                    }
                },
                enumerable: true,
                configurable: true
            });
        });

        Object.keys(component._methods).forEach(key => {
            component[key] = component._methods[key].bind(component);
        });

        Object.keys(component._computed).forEach(key => {
            Object.defineProperty(component, key, {
                get: function() {
                    return component._computed[key].call(component);
                },
                enumerable: true,
                configurable: true
            });
        });

        if (component._hooks.created) {
            component._hooks.created.call(component);
        }

        component.mount = function(selector) {
            if (component._hooks.beforeMount) {
                component._hooks.beforeMount.call(component);
            }
            
            component.$el = typeof selector === 'string' 
                ? document.querySelector(selector) 
                : selector;
            
            if (config.template && component.$el) {
                component.$el.innerHTML = typeof config.template === 'function'
                    ? config.template.call(component)
                    : config.template;
            }
            
            if (component._hooks.mounted) {
                component._hooks.mounted.call(component);
            }
            
            return component;
        };

        component.destroy = function() {
            if (component._hooks.beforeDestroy) {
                component._hooks.beforeDestroy.call(component);
            }
            
            component.off();
            
            if (component.$el) {
                component.$el.innerHTML = '';
            }
            
            if (component._hooks.destroyed) {
                component._hooks.destroyed.call(component);
            }
        };

        return component;
    };

    Onigiri.modules.components = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
