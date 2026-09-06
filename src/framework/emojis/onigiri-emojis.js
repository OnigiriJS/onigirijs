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

    // OnigiriJS Module: emojis

    /**
     * Emoji Module - Picker, parser, and utilities
     */
    Onigiri.emojis = {
        _config: {
            storageKey: 'onigiri_emoji_recents',
            maxRecents: 30,
            showRecents: true,
            showSearch: true,
            theme: 'light',
            position: 'bottom-right',
            categories: true,
            skinTones: false,
            insertTarget: null
        },

        _picker: null,
        _recents: [],
        _currentInput: null,

        /**
         * Emoji database organized by category
         */
        _emojis: {
            recents: [],
            smileys: [
                '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
                '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
                '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
                '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
                '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
            ],
            gestures: [
                '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘',
                '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐',
                '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🤝', '👏',
                '👐', '🙌', '🤲', '🤝'
            ],
            people: [
                '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '👨‍🦱', '👩‍🦰',
                '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '👨‍🦳', '👩‍🦲', '👨‍🦲', '🧔', '👵',
                '🧓', '👴', '👲', '👳‍♀️', '👳', '👳‍♂️', '🧕', '👮‍♀️', '👮', '👮‍♂️'
            ],
            animals: [
                '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
                '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
                '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
                '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
                '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕'
            ],
            food: [
                '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈',
                '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                '🥬', '🥒', '🌶', '🌽', '🥕', '🥔', '🍠', '🥐', '🥖', '🍞',
                '🥨', '🥯', '🧀', '🥚', '🍳', '🥞', '🥓', '🥩', '🍗', '🍖',
                '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘'
            ],
            activities: [
                '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
                '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁',
                '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌',
                '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾',
                '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴'
            ],
            travel: [
                '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐',
                '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔',
                '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝',
                '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫',
                '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤'
            ],
            objects: [
                '⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹',
                '🗜', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽',
                '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛',
                '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡',
                '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷'
            ],
            symbols: [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
                '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
                '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
                '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
                '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳'
            ],
            flags: [
                '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱',
                '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼'
            ]
        },

        /**
         * Initialize emoji module
         */
        init: function(options) {
            Onigiri.extend(this._config, options || {});
            this._loadRecents();
            this._updateRecentsCategory();
            return this;
        },

        /**
         * Create and show emoji picker
         */
        show: function(target, options) {
            this._currentInput = target;
            
            if (this._picker) {
                this.hide();
            }

            const config = Onigiri.extend({}, this._config, options || {});
            this._picker = this._createPicker(config);
            
            document.body.appendChild(this._picker);
            this._positionPicker(target, config.position);
            
            // Bind events
            this._bindPickerEvents();
            
            // Focus search if enabled
            if (config.showSearch) {
                const searchInput = this._picker.querySelector('.emoji-search');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }

            return this;
        },

        /**
         * Hide emoji picker
         */
        hide: function() {
            if (this._picker) {
                this._picker.remove();
                this._picker = null;
            }
            return this;
        },

        /**
         * Create picker HTML
         */
        _createPicker: function(config) {
            const picker = document.createElement('div');
            picker.className = `emoji-picker theme-${config.theme}`;
            picker.innerHTML = `
                <div class="emoji-picker-header">
                    ${config.showSearch ? `
                        <input type="text" 
                               class="emoji-search" 
                               placeholder="Search emoji..." 
                               autocomplete="off">
                    ` : ''}
                    <button class="emoji-picker-close" aria-label="Close">✕</button>
                </div>
                ${config.categories ? `
                    <div class="emoji-categories">
                        ${config.showRecents && this._recents.length > 0 ? 
                            '<button class="emoji-cat-btn active" data-category="recents">🕐</button>' : ''}
                        <button class="emoji-cat-btn ${!config.showRecents || this._recents.length === 0 ? 'active' : ''}" data-category="smileys">😀</button>
                        <button class="emoji-cat-btn" data-category="gestures">👍</button>
                        <button class="emoji-cat-btn" data-category="people">👤</button>
                        <button class="emoji-cat-btn" data-category="animals">🐶</button>
                        <button class="emoji-cat-btn" data-category="food">🍕</button>
                        <button class="emoji-cat-btn" data-category="activities">⚽</button>
                        <button class="emoji-cat-btn" data-category="travel">🚗</button>
                        <button class="emoji-cat-btn" data-category="objects">💡</button>
                        <button class="emoji-cat-btn" data-category="symbols">❤️</button>
                        <button class="emoji-cat-btn" data-category="flags">🏁</button>
                    </div>
                ` : ''}
                <div class="emoji-grid" data-category="${config.showRecents && this._recents.length > 0 ? 'recents' : 'smileys'}">
                    ${this._renderEmojiGrid(config.showRecents && this._recents.length > 0 ? 'recents' : 'smileys')}
                </div>
            `;
            return picker;
        },

        /**
         * Render emoji grid for a category
         */
        _renderEmojiGrid: function(category) {
            const emojis = this._emojis[category] || [];
            return emojis.map(emoji => 
                `<button class="emoji-btn" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`
            ).join('');
        },

        /**
         * Position picker relative to target
         */
        _positionPicker: function(target, position) {
            if (!this._picker || !target) return;

            const rect = target.getBoundingClientRect();
            const pickerRect = this._picker.getBoundingClientRect();

            let top, left;

            switch (position) {
                case 'top-left':
                    top = rect.top - pickerRect.height - 10;
                    left = rect.left;
                    break;
                case 'top-right':
                    top = rect.top - pickerRect.height - 10;
                    left = rect.right - pickerRect.width;
                    break;
                case 'bottom-left':
                    top = rect.bottom + 10;
                    left = rect.left;
                    break;
                case 'bottom-right':
                default:
                    top = rect.bottom + 10;
                    left = rect.right - pickerRect.width;
                    break;
            }

            // Keep picker on screen
            if (top < 10) top = 10;
            if (left < 10) left = 10;
            if (top + pickerRect.height > window.innerHeight - 10) {
                top = window.innerHeight - pickerRect.height - 10;
            }
            if (left + pickerRect.width > window.innerWidth - 10) {
                left = window.innerWidth - pickerRect.width - 10;
            }

            this._picker.style.top = top + 'px';
            this._picker.style.left = left + 'px';
        },

        /**
         * Bind picker event handlers
         */
        _bindPickerEvents: function() {
            if (!this._picker) return;

            // Close button
            const closeBtn = this._picker.querySelector('.emoji-picker-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hide());
            }

            // Emoji selection
            this._picker.addEventListener('click', (e) => {
                const emojiBtn = e.target.closest('.emoji-btn');
                if (emojiBtn) {
                    const emoji = emojiBtn.getAttribute('data-emoji');
                    this._selectEmoji(emoji);
                }
            });

            // Category switching
            this._picker.addEventListener('click', (e) => {
                const catBtn = e.target.closest('.emoji-cat-btn');
                if (catBtn) {
                    const category = catBtn.getAttribute('data-category');
                    this._switchCategory(category);
                }
            });

            // Search
            const searchInput = this._picker.querySelector('.emoji-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this._searchEmojis(e.target.value);
                });
            }

            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', this._outsideClickHandler = (e) => {
                    if (this._picker && !this._picker.contains(e.target) && 
                        e.target !== this._currentInput) {
                        this.hide();
                    }
                });
            }, 100);
        },

        /**
         * Select emoji and insert into target
         */
        _selectEmoji: function(emoji) {
            if (this._currentInput) {
                if (this._currentInput.tagName === 'INPUT' || 
                    this._currentInput.tagName === 'TEXTAREA') {
                    const start = this._currentInput.selectionStart;
                    const end = this._currentInput.selectionEnd;
                    const text = this._currentInput.value;
                    
                    this._currentInput.value = text.substring(0, start) + emoji + text.substring(end);
                    this._currentInput.selectionStart = this._currentInput.selectionEnd = start + emoji.length;
                    this._currentInput.focus();
                } else if (this._currentInput.contentEditable === 'true') {
                    document.execCommand('insertText', false, emoji);
                }
            }

            this._addToRecents(emoji);
            
            // Emit event
            document.dispatchEvent(new CustomEvent('onigiri:emoji:selected', {
                detail: { emoji: emoji, target: this._currentInput }
            }));

            // Optional: keep picker open or close it
            // this.hide();
        },

        /**
         * Switch category
         */
        _switchCategory: function(category) {
            if (!this._picker) return;

            // Update active button
            const buttons = this._picker.querySelectorAll('.emoji-cat-btn');
            buttons.forEach(btn => {
                if (btn.getAttribute('data-category') === category) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Update grid
            const grid = this._picker.querySelector('.emoji-grid');
            if (grid) {
                grid.setAttribute('data-category', category);
                grid.innerHTML = this._renderEmojiGrid(category);
            }
        },

        /**
         * Search emojis
         */
        _searchEmojis: function(query) {
            if (!this._picker) return;

            query = query.toLowerCase().trim();
            const grid = this._picker.querySelector('.emoji-grid');
            
            if (!query) {
                // Show current category
                const currentCat = grid.getAttribute('data-category') || 'smileys';
                grid.innerHTML = this._renderEmojiGrid(currentCat);
                return;
            }

            // Search all categories
            const results = [];
            Object.keys(this._emojis).forEach(category => {
                if (category === 'recents') return;
                this._emojis[category].forEach(emoji => {
                    if (results.length < 50) { // Limit results
                        results.push(emoji);
                    }
                });
            });

            grid.innerHTML = results.map(emoji => 
                `<button class="emoji-btn" data-emoji="${emoji}" title="${emoji}">${emoji}</button>`
            ).join('') || '<div class="emoji-no-results">No emojis found</div>';
        },

        /**
         * Add emoji to recents
         */
        _addToRecents: function(emoji) {
            // Remove if already exists
            this._recents = this._recents.filter(e => e !== emoji);
            
            // Add to beginning
            this._recents.unshift(emoji);
            
            // Limit size
            if (this._recents.length > this._config.maxRecents) {
                this._recents = this._recents.slice(0, this._config.maxRecents);
            }
            
            this._saveRecents();
            this._updateRecentsCategory();
        },

        /**
         * Update recents category
         */
        _updateRecentsCategory: function() {
            this._emojis.recents = this._recents;
        },

        /**
         * Load recents from storage
         */
        _loadRecents: function() {
            if (Onigiri.modules.storage) {
                this._recents = Onigiri.storage.get(this._config.storageKey) || [];
            }
        },

        /**
         * Save recents to storage
         */
        _saveRecents: function() {
            if (Onigiri.modules.storage) {
                Onigiri.storage.set(this._config.storageKey, this._recents);
            }
        },

        /**
         * Parse text and replace :emoji: codes with actual emojis
         */
        parse: function(text) {
            const codes = {
                ':smile:': '😊',
                ':heart:': '❤️',
                ':thumbsup:': '👍',
                ':thumbsdown:': '👎',
                ':fire:': '🔥',
                ':star:': '⭐',
                ':check:': '✅',
                ':cross:': '❌',
                ':warning:': '⚠️',
                ':info:': 'ℹ️',
                ':onigiri:': '🍙',
                ':sushi:': '🍣',
                ':pizza:': '🍕',
                ':burger:': '🍔',
                ':coffee:': '☕',
                ':beer:': '🍺',
                ':rocket:': '🚀',
                ':tada:': '🎉',
                ':clap:': '👏',
                ':pray:': '🙏'
            };

            Object.keys(codes).forEach(code => {
                text = text.split(code).join(codes[code]);
            });

            return text;
        },

        /**
         * Get random emoji from category
         */
        random: function(category) {
            const cat = category || 'smileys';
            const emojis = this._emojis[cat] || this._emojis.smileys;
            return emojis[Math.floor(Math.random() * emojis.length)];
        }
    };

    /**
     * Add emoji methods to Onigiri prototype
     */
    Onigiri.prototype.emojiPicker = function(options) {
        this.each(el => {
            el.addEventListener('click', () => {
                Onigiri.emojis.show(el, options);
            });
        });
        return this;
    };

    Onigiri.prototype.parseEmojis = function() {
        this.each(el => {
            el.textContent = Onigiri.emojis.parse(el.textContent);
        });
        return this;
    };

    Onigiri.modules.emojis = true;

})(typeof Onigiri !== 'undefined' ? Onigiri : null);
