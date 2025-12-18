// Comprehensive unit tests for OnigiriJS framework core
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');

// Mock the global Onigiri object
global.Onigiri = require('../src/framework/onigiri.core.js');

describe('OnigiriJS Core', () => {
  let testDiv;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-container">
        <div class="test-class" data-value="test">Test 1</div>
        <div class="test-class" data-value="test2">Test 2</div>
        <button id="test-btn">Click Me</button>
        <input type="text" id="test-input" value="initial">
        <form id="test-form">
          <input type="text" name="username">
          <input type="email" name="email">
        </form>
      </div>
    `;
    testDiv = document.getElementById('test-container');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Constructor and Selector', () => {
    it('should create Onigiri instance with string selector', () => {
      const o = new Onigiri('.test-class');
      expect(o.elements.length).toBe(2);
      expect(o.length).toBe(2);
    });

    it('should work without new keyword', () => {
      const o = Onigiri('.test-class');
      expect(o).toBeInstanceOf(Onigiri);
      expect(o.length).toBe(2);
    });

    it('should accept HTMLElement', () => {
      const el = document.getElementById('test-btn');
      const o = new Onigiri(el);
      expect(o.elements.length).toBe(1);
      expect(o.elements[0]).toBe(el);
    });

    it('should accept NodeList', () => {
      const nodes = document.querySelectorAll('.test-class');
      const o = new Onigiri(nodes);
      expect(o.elements.length).toBe(2);
    });

    it('should accept Array', () => {
      const elements = Array.from(document.querySelectorAll('.test-class'));
      const o = new Onigiri(elements);
      expect(o.elements.length).toBe(2);
    });

    it('should use context parameter', () => {
      const container = document.getElementById('test-container');
      const o = new Onigiri('.test-class', container);
      expect(o.elements.length).toBe(2);
    });
  });

  describe('Version and Metadata', () => {
    it('should have version property', () => {
      expect(Onigiri.version).toBeDefined();
      expect(typeof Onigiri.version).toBe('string');
    });

    it('should have modules object', () => {
      expect(Onigiri.modules).toBeDefined();
      expect(typeof Onigiri.modules).toBe('object');
    });
  });

  describe('DOM Manipulation - each()', () => {
    it('should iterate over all elements', () => {
      const o = new Onigiri('.test-class');
      const elements = [];
      o.each((el, idx) => {
        elements.push(el);
      });
      expect(elements.length).toBe(2);
    });

    it('should provide index to callback', () => {
      const o = new Onigiri('.test-class');
      const indices = [];
      o.each((el, idx) => indices.push(idx));
      expect(indices).toEqual([0, 1]);
    });

    it('should return this for chaining', () => {
      const o = new Onigiri('.test-class');
      expect(o.each(() => {})).toBe(o);
    });
  });

  describe('Event Handling', () => {
    it('should attach event listener with on()', () => {
      const o = new Onigiri('#test-btn');
      const handler = jest.fn();
      o.on('click', handler);
      
      o.elements[0].click();
      expect(handler).toHaveBeenCalled();
    });

    it('should support event delegation', () => {
      const o = new Onigiri('#test-container');
      const handler = jest.fn();
      o.on('click', '.test-class', handler);
      
      document.querySelector('.test-class').click();
      expect(handler).toHaveBeenCalled();
    });

    it('should remove event listener with off()', () => {
      const o = new Onigiri('#test-btn');
      const handler = jest.fn();
      o.on('click', handler);
      o.off('click', handler);
      
      o.elements[0].click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should trigger custom events', () => {
      const o = new Onigiri('#test-btn');
      const handler = jest.fn();
      o.elements[0].addEventListener('custom', handler);
      
      o.trigger('custom', { test: 'data' });
      expect(handler).toHaveBeenCalled();
    });

    it('should pass data with triggered events', () => {
      const o = new Onigiri('#test-btn');
      let receivedData;
      o.elements[0].addEventListener('custom', (e) => {
        receivedData = e.detail;
      });
      
      o.trigger('custom', { value: 123 });
      expect(receivedData).toEqual({ value: 123 });
    });
  });

  describe('Class Manipulation', () => {
    it('should add class with addClass()', () => {
      const o = new Onigiri('.test-class');
      o.addClass('new-class');
      
      expect(o.elements[0].classList.contains('new-class')).toBe(true);
      expect(o.elements[1].classList.contains('new-class')).toBe(true);
    });

    it('should remove class with removeClass()', () => {
      const o = new Onigiri('.test-class');
      o.removeClass('test-class');
      
      expect(o.elements[0].classList.contains('test-class')).toBe(false);
    });

    it('should toggle class with toggleClass()', () => {
      const o = new Onigiri('.test-class');
      o.toggleClass('active');
      expect(o.elements[0].classList.contains('active')).toBe(true);
      
      o.toggleClass('active');
      expect(o.elements[0].classList.contains('active')).toBe(false);
    });

    it('should check class with hasClass()', () => {
      const o = new Onigiri('.test-class');
      expect(o.hasClass('test-class')).toBe(true);
      expect(o.hasClass('not-exists')).toBe(false);
    });

    it('should return false for hasClass() on empty selection', () => {
      const o = new Onigiri('.not-exists');
      expect(o.hasClass('any-class')).toBe(false);
    });
  });

  describe('Attribute Manipulation', () => {
    it('should get attribute value', () => {
      const o = new Onigiri('.test-class');
      expect(o.attr('data-value')).toBe('test');
    });

    it('should set attribute value', () => {
      const o = new Onigiri('.test-class');
      o.attr('data-test', 'value');
      expect(o.elements[0].getAttribute('data-test')).toBe('value');
    });

    it('should remove attribute with removeAttr()', () => {
      const o = new Onigiri('.test-class');
      o.removeAttr('data-value');
      expect(o.elements[0].hasAttribute('data-value')).toBe(false);
    });

    it('should return null for attr() on empty selection', () => {
      const o = new Onigiri('.not-exists');
      expect(o.attr('data-value')).toBeNull();
    });
  });

  describe('Data Attributes', () => {
    it('should get data attribute', () => {
      const o = new Onigiri('.test-class');
      expect(o.data('value')).toBe('test');
    });

    it('should set data attribute', () => {
      const o = new Onigiri('.test-class');
      o.data('new', 'value');
      expect(o.elements[0].dataset.new).toBe('value');
    });

    it('should return null for data() on empty selection', () => {
      const o = new Onigiri('.not-exists');
      expect(o.data('value')).toBeNull();
    });
  });

  describe('Content Manipulation', () => {
    it('should get HTML content', () => {
      const o = new Onigiri('.test-class');
      expect(o.html()).toBe('Test 1');
    });

    it('should set HTML content', () => {
      const o = new Onigiri('.test-class');
      o.html('<strong>New</strong>');
      expect(o.elements[0].innerHTML).toBe('<strong>New</strong>');
    });

    it('should get text content', () => {
      const o = new Onigiri('.test-class');
      expect(o.text()).toBe('Test 1');
    });

    it('should set text content', () => {
      const o = new Onigiri('.test-class');
      o.text('New Text');
      expect(o.elements[0].textContent).toBe('New Text');
    });

    it('should get input value', () => {
      const o = new Onigiri('#test-input');
      expect(o.val()).toBe('initial');
    });

    it('should set input value', () => {
      const o = new Onigiri('#test-input');
      o.val('updated');
      expect(o.elements[0].value).toBe('updated');
    });
  });

  describe('CSS Manipulation', () => {
    it('should set single CSS property', () => {
      const o = new Onigiri('.test-class');
      o.css('color', 'red');
      expect(o.elements[0].style.color).toBe('red');
    });

    it('should set multiple CSS properties', () => {
      const o = new Onigiri('.test-class');
      o.css({ color: 'red', fontSize: '16px' });
      expect(o.elements[0].style.color).toBe('red');
      expect(o.elements[0].style.fontSize).toBe('16px');
    });

    it('should get computed CSS property', () => {
      const o = new Onigiri('.test-class');
      o.elements[0].style.display = 'block';
      expect(o.css('display')).toBe('block');
    });

    it('should show elements', () => {
      const o = new Onigiri('.test-class');
      o.hide();
      o.show();
      expect(o.elements[0].style.display).toBe('');
    });

    it('should hide elements', () => {
      const o = new Onigiri('.test-class');
      o.hide();
      expect(o.elements[0].style.display).toBe('none');
    });
  });

  describe('DOM Insertion', () => {
    it('should append HTML string', () => {
      const o = new Onigiri('#test-container');
      o.append('<div class="appended">Appended</div>');
      expect(document.querySelector('.appended')).toBeTruthy();
    });

    it('should append HTMLElement', () => {
      const o = new Onigiri('#test-container');
      const el = document.createElement('div');
      el.className = 'appended';
      o.append(el);
      expect(document.querySelector('.appended')).toBeTruthy();
    });

    it('should prepend HTML string', () => {
      const o = new Onigiri('#test-container');
      o.prepend('<div class="prepended">Prepended</div>');
      expect(testDiv.firstElementChild.className).toBe('prepended');
    });

    it('should prepend HTMLElement', () => {
      const o = new Onigiri('#test-container');
      const el = document.createElement('div');
      el.className = 'prepended';
      o.prepend(el);
      expect(testDiv.firstElementChild.className).toBe('prepended');
    });

    it('should remove elements', () => {
      const o = new Onigiri('.test-class');
      o.remove();
      expect(document.querySelectorAll('.test-class').length).toBe(0);
    });

    it('should empty elements', () => {
      const o = new Onigiri('#test-container');
      o.empty();
      expect(testDiv.innerHTML).toBe('');
    });
  });

  describe('Traversal Methods', () => {
    it('should find child elements', () => {
      const o = new Onigiri('#test-container');
      const found = o.find('.test-class');
      expect(found.length).toBe(2);
      expect(found).toBeInstanceOf(Onigiri);
    });

    it('should get parent elements', () => {
      const o = new Onigiri('.test-class');
      const parent = o.parent();
      expect(parent.length).toBe(1);
      expect(parent.elements[0]).toBe(testDiv);
    });

    it('should get children elements', () => {
      const o = new Onigiri('#test-container');
      const children = o.children();
      expect(children.length).toBeGreaterThan(0);
    });

    it('should get siblings', () => {
      const o = new Onigiri('.test-class').elements[0];
      const onigiri = new Onigiri(o);
      const siblings = onigiri.siblings();
      expect(siblings.length).toBeGreaterThan(0);
    });
  });

  describe('Utility Methods - Onigiri.extend()', () => {
    it('should extend object with sources', () => {
      const target = { a: 1 };
      const result = Onigiri.extend(target, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
      expect(result).toBe(target);
    });

    it('should override existing properties', () => {
      const target = { a: 1, b: 2 };
      Onigiri.extend(target, { b: 3 });
      expect(target.b).toBe(3);
    });
  });

  describe('Utility Methods - Onigiri.debounce()', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debounced = Onigiri.debounce(func, 100);
      
      debounced();
      debounced();
      debounced();
      
      expect(func).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(func).toHaveBeenCalledTimes(1);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('Utility Methods - Onigiri.throttle()', () => {
    jest.useFakeTimers();

    it('should throttle function calls', () => {
      const func = jest.fn();
      const throttled = Onigiri.throttle(func, 100);
      
      throttled();
      throttled();
      throttled();
      
      expect(func).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(100);
      throttled();
      expect(func).toHaveBeenCalledTimes(2);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });

  describe('Type Checking Utilities', () => {
    it('should check if value is array', () => {
      expect(Onigiri.isArray([])).toBe(true);
      expect(Onigiri.isArray({})).toBe(false);
      expect(Onigiri.isArray('string')).toBe(false);
    });

    it('should check if value is object', () => {
      expect(Onigiri.isObject({})).toBe(true);
      expect(Onigiri.isObject([])).toBe(false);
      expect(Onigiri.isObject(null)).toBe(false);
    });

    it('should check if value is function', () => {
      expect(Onigiri.isFunction(() => {})).toBe(true);
      expect(Onigiri.isFunction({})).toBe(false);
    });

    it('should check if value is empty', () => {
      expect(Onigiri.isEmpty(null)).toBe(true);
      expect(Onigiri.isEmpty([])).toBe(true);
      expect(Onigiri.isEmpty('')).toBe(true);
      expect(Onigiri.isEmpty({})).toBe(true);
      expect(Onigiri.isEmpty([1])).toBe(false);
      expect(Onigiri.isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('Onigiri.clone()', () => {
    it('should deep clone object', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = Onigiri.clone(original);
      
      cloned.b.c = 3;
      
      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });

    it('should clone arrays', () => {
      const original = [1, 2, { a: 3 }];
      const cloned = Onigiri.clone(original);
      
      cloned[2].a = 4;
      
      expect(original[2].a).toBe(3);
      expect(cloned[2].a).toBe(4);
    });
  });

  describe('Plugin System', () => {
    it('should have plugins object', () => {
      expect(Onigiri.plugins).toBeDefined();
      expect(typeof Onigiri.plugins).toBe('object');
    });

    it('should register plugin with use() method', () => {
      const plugin = jest.fn((Onigiri, options) => {
        Onigiri.testPlugin = true;
      });
      
      Onigiri.use(plugin, { test: true });
      
      expect(plugin).toHaveBeenCalledWith(Onigiri, { test: true });
      expect(Onigiri.testPlugin).toBe(true);
    });

    it('should support plugin with install method', () => {
      const plugin = {
        install: jest.fn((Onigiri, options) => {
          Onigiri.installedPlugin = true;
        })
      };
      
      Onigiri.use(plugin, { test: true });
      
      expect(plugin.install).toHaveBeenCalledWith(Onigiri, { test: true });
      expect(Onigiri.installedPlugin).toBe(true);
    });

    it('should return Onigiri for chaining', () => {
      const result = Onigiri.use(() => {});
      expect(result).toBe(Onigiri);
    });
  });

  describe('Method Chaining', () => {
    it('should support method chaining', () => {
      const o = new Onigiri('.test-class');
      const result = o
        .addClass('chain-1')
        .addClass('chain-2')
        .attr('data-chained', 'true')
        .css('color', 'blue');
      
      expect(result).toBe(o);
      expect(o.hasClass('chain-1')).toBe(true);
      expect(o.hasClass('chain-2')).toBe(true);
      expect(o.attr('data-chained')).toBe('true');
      expect(o.css('color')).toBe('blue');
    });
  });

  describe('Global Export', () => {
    it('should export Onigiri to global scope', () => {
      expect(global.Onigiri).toBeDefined();
    });

    it('should export O alias to global scope', () => {
      expect(global.O).toBeDefined();
      expect(global.O).toBe(global.Onigiri);
    });
  });
});
