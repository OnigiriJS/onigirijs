// Tests for all OnigiriJS modules
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');

describe('OnigiriJS AJAX Module', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.ajax.js');
  });

  it('should register ajax module', () => {
    expect(global.Onigiri.modules.ajax).toBe(true);
  });

  it('should make GET request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
      headers: new Map([['content-type', 'application/json']])
    });

    const result = await Onigiri.get('https://api.test.com/data');
    expect(result).toEqual({ data: 'test' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/data',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('should make POST request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      headers: new Map([['content-type', 'application/json']])
    });

    await Onigiri.post('https://api.test.com/data', { name: 'test' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/data',
      expect.objectContaining({ 
        method: 'POST',
        body: JSON.stringify({ name: 'test' })
      })
    );
  });

  it('should make PUT request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ updated: true }),
      headers: new Map([['content-type', 'application/json']])
    });

    await Onigiri.put('https://api.test.com/data/1', { name: 'updated' });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/data/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('should make DELETE request', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ deleted: true }),
      headers: new Map([['content-type', 'application/json']])
    });

    await Onigiri.delete('https://api.test.com/data/1');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.test.com/data/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should handle text responses', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => 'plain text',
      headers: new Map([['content-type', 'text/plain']])
    });

    const result = await Onigiri.get('https://api.test.com/text');
    expect(result).toBe('plain text');
  });

  it('should handle errors', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(Onigiri.get('https://api.test.com/notfound'))
      .rejects.toThrow('HTTP error! status: 404');
  });

  it('should handle timeout', async () => {
    jest.useFakeTimers();
    global.fetch.mockImplementation(() => new Promise(() => {}));

    const promise = Onigiri.ajax({ url: 'https://api.test.com/slow', timeout: 1000 });
    
    jest.advanceTimersByTime(1000);
    
    await expect(promise).rejects.toThrow();
    jest.useRealTimers();
  });
});

describe('OnigiriJS Animation Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="test" style="display: block; opacity: 1;">Test</div>';
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.animate.js');
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  });

  it('should register animate module', () => {
    expect(global.Onigiri.modules.animate).toBe(true);
  });

  it('should have fadeIn method', () => {
    const o = new Onigiri('#test');
    expect(typeof o.fadeIn).toBe('function');
  });

  it('should have fadeOut method', () => {
    const o = new Onigiri('#test');
    expect(typeof o.fadeOut).toBe('function');
  });

  it('should have slideDown method', () => {
    const o = new Onigiri('#test');
    expect(typeof o.slideDown).toBe('function');
  });

  it('should have slideUp method', () => {
    const o = new Onigiri('#test');
    expect(typeof o.slideUp).toBe('function');
  });

  it('should fade in element', (done) => {
    const o = new Onigiri('#test');
    o.elements[0].style.display = 'none';
    
    o.fadeIn(100, function() {
      expect(this.style.display).not.toBe('none');
      done();
    });
  });

  it('should fade out element', (done) => {
    const o = new Onigiri('#test');
    
    o.fadeOut(100, function() {
      expect(this.style.display).toBe('none');
      done();
    });
  });
});

describe('OnigiriJS Component Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.events.js');
    require('../src/framework/onigiri.components.js');
  });

  it('should register components module', () => {
    expect(global.Onigiri.modules.components).toBe(true);
  });

  it('should create component with data', () => {
    const component = new Onigiri().Component({
      data: {
        message: 'Hello',
        count: 0
      }
    });

    expect(component.message).toBe('Hello');
    expect(component.count).toBe(0);
  });

  it('should create reactive properties', () => {
    const component = new Onigiri().Component({
      data: { count: 0 }
    });

    component.count = 5;
    expect(component.count).toBe(5);
  });

  it('should call watchers on property change', (done) => {
    const component = new Onigiri().Component({
      data: { count: 0 },
      watchers: {
        count: function(newVal, oldVal) {
          expect(newVal).toBe(1);
          expect(oldVal).toBe(0);
          done();
        }
      }
    });

    component.count = 1;
  });

  it('should add methods to component', () => {
    const component = new Onigiri().Component({
      data: { count: 0 },
      methods: {
        increment() {
          this.count++;
        }
      }
    });

    component.increment();
    expect(component.count).toBe(1);
  });

  it('should add computed properties', () => {
    const component = new Onigiri().Component({
      data: { firstName: 'John', lastName: 'Doe' },
      computed: {
        fullName() {
          return `${this.firstName} ${this.lastName}`;
        }
      }
    });

    expect(component.fullName).toBe('John Doe');
  });

  it('should call lifecycle hooks', () => {
    const beforeCreate = jest.fn();
    const created = jest.fn();
    const beforeMount = jest.fn();
    const mounted = jest.fn();

    const component = new Onigiri().Component({
      data: {},
      beforeCreate,
      created,
      beforeMount,
      mounted
    });

    expect(beforeCreate).toHaveBeenCalled();
    expect(created).toHaveBeenCalled();

    component.mount('#app');
    expect(beforeMount).toHaveBeenCalled();
    expect(mounted).toHaveBeenCalled();
  });

  it('should mount component with template', () => {
    const component = new Onigiri().Component({
      data: { message: 'Hello' },
      template: function() {
        return `<h1>${this.message}</h1>`;
      }
    });

    component.mount('#app');
    expect(document.getElementById('app').innerHTML).toBe('<h1>Hello</h1>');
  });

  it('should destroy component', () => {
    const beforeDestroy = jest.fn();
    const destroyed = jest.fn();

    const component = new Onigiri().Component({
      data: {},
      beforeDestroy,
      destroyed
    });

    component.mount('#app');
    component.destroy();

    expect(beforeDestroy).toHaveBeenCalled();
    expect(destroyed).toHaveBeenCalled();
    expect(document.getElementById('app').innerHTML).toBe('');
  });
});

describe('OnigiriJS Event Emitter Module', () => {
  beforeEach(() => {
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.events.js');
  });

  it('should register events module', () => {
    expect(global.Onigiri.modules.events).toBe(true);
  });

  it('should create EventEmitter', () => {
    const emitter = new Onigiri().EventEmitter();
    expect(emitter._events).toBeDefined();
  });

  it('should register event handlers', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler = jest.fn();
    
    emitter.on('test', handler);
    emitter.emit('test', 'data');
    
    expect(handler).toHaveBeenCalledWith('data');
  });

  it('should support event namespaces', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler = jest.fn();
    
    emitter.on('test', handler, 'namespace');
    emitter.emit('test', 'data');
    
    expect(handler).toHaveBeenCalledWith('data');
  });

  it('should remove event handlers', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler = jest.fn();
    
    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test');
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should support once listeners', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler = jest.fn();
    
    emitter.once('test', handler);
    emitter.emit('test');
    emitter.emit('test');
    
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should remove all handlers for an event', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    
    emitter.on('test', handler1);
    emitter.on('test', handler2);
    emitter.off('test');
    emitter.emit('test');
    
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('should remove all events', () => {
    const emitter = new Onigiri().EventEmitter();
    const handler = jest.fn();
    
    emitter.on('test1', handler);
    emitter.on('test2', handler);
    emitter.off();
    emitter.emit('test1');
    emitter.emit('test2');
    
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('OnigiriJS Storage Module', () => {
  beforeEach(() => {
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.storage.js');
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should register storage module', () => {
    expect(global.Onigiri.modules.storage).toBe(true);
  });

  it('should set and get values', () => {
    Onigiri.storage.set('test', 'value');
    expect(Onigiri.storage.get('test')).toBe('value');
  });

  it('should store complex objects', () => {
    const obj = { name: 'test', count: 5 };
    Onigiri.storage.set('object', obj);
    expect(Onigiri.storage.get('object')).toEqual(obj);
  });

  it('should remove values', () => {
    Onigiri.storage.set('test', 'value');
    Onigiri.storage.remove('test');
    expect(Onigiri.storage.get('test')).toBeNull();
  });

  it('should check if key exists', () => {
    Onigiri.storage.set('test', 'value');
    expect(Onigiri.storage.has('test')).toBe(true);
    expect(Onigiri.storage.has('notexist')).toBe(false);
  });

  it('should get all keys', () => {
    Onigiri.storage.set('key1', 'value1');
    Onigiri.storage.set('key2', 'value2');
    const keys = Onigiri.storage.keys();
    expect(keys).toContain('key1');
    expect(keys).toContain('key2');
  });

  it('should clear all storage', () => {
    Onigiri.storage.set('key1', 'value1');
    Onigiri.storage.set('key2', 'value2');
    Onigiri.storage.clear();
    expect(Onigiri.storage.size()).toBe(0);
  });

  it('should handle expiration', (done) => {
    Onigiri.storage.set('expiring', 'value', { expires: 100 });
    
    setTimeout(() => {
      expect(Onigiri.storage.get('expiring')).toBeNull();
      done();
    }, 150);
  });

  it('should use custom prefix', () => {
    Onigiri.storage.setPrefix('custom_');
    Onigiri.storage.set('test', 'value');
    expect(localStorage.getItem('custom_test')).toBeTruthy();
  });

  describe('Session Storage', () => {
    it('should set and get session values', () => {
      Onigiri.storage.session.set('test', 'value');
      expect(Onigiri.storage.session.get('test')).toBe('value');
    });

    it('should remove session values', () => {
      Onigiri.storage.session.set('test', 'value');
      Onigiri.storage.session.remove('test');
      expect(Onigiri.storage.session.get('test')).toBeNull();
    });

    it('should clear session storage', () => {
      Onigiri.storage.session.set('key1', 'value1');
      Onigiri.storage.session.set('key2', 'value2');
      Onigiri.storage.session.clear();
      expect(Onigiri.storage.session.keys().length).toBe(0);
    });
  });
});

describe('OnigiriJS Validation Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="test-form">
        <input type="text" name="username" value="">
        <input type="email" name="email" value="">
        <input type="number" name="age" value="">
      </form>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.validation.js');
  });

  it('should register validation module', () => {
    expect(global.Onigiri.modules.validation).toBe(true);
  });

  it('should validate required fields', () => {
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { username: { required: true } }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors.username).toBeDefined();
  });

  it('should validate email format', () => {
    document.querySelector('[name="email"]').value = 'invalid';
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { email: { email: true } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should validate min value', () => {
    document.querySelector('[name="age"]').value = '5';
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { age: { min: 18 } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should validate max value', () => {
    document.querySelector('[name="age"]').value = '150';
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { age: { max: 120 } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should validate minLength', () => {
    document.querySelector('[name="username"]').value = 'ab';
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { username: { minLength: 3 } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should validate maxLength', () => {
    document.querySelector('[name="username"]').value = 'a'.repeat(20);
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { username: { maxLength: 10 } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should validate pattern', () => {
    document.querySelector('[name="username"]').value = '123';
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      { username: { pattern: '^[a-zA-Z]+$' } }
    );
    expect(result.isValid).toBe(false);
  });

  it('should pass valid form', () => {
    document.querySelector('[name="username"]').value = 'john';
    document.querySelector('[name="email"]').value = 'john@example.com';
    document.querySelector('[name="age"]').value = '25';
    
    const result = Onigiri.validation.validate(
      document.getElementById('test-form'),
      {
        username: { required: true, minLength: 3 },
        email: { required: true, email: true },
        age: { min: 18, max: 100 }
      }
    );
    
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });

  it('should add custom validation rules', () => {
    Onigiri.validation.addRule('custom', (value) => value === 'test', 'Must be test');
    expect(Onigiri.validation.rules.custom).toBeDefined();
    expect(Onigiri.validation.messages.custom).toBe('Must be test');
  });

  it('should validate through Onigiri prototype', () => {
    const o = new Onigiri('#test-form');
    const result = o.validate({ username: { required: true } });
    expect(result.isValid).toBe(false);
  });
});

describe('OnigiriJS Security Module', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="csrf-token" content="test-token">';
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.security.js');
    Onigiri.security.init();
  });

  it('should register security module', () => {
    expect(global.Onigiri.modules.security).toBe(true);
  });

  it('should get CSRF token from meta tag', () => {
    expect(Onigiri.security.getToken()).toBe('test-token');
  });

  it('should set CSRF token', () => {
    Onigiri.security.setToken('new-token');
    expect(Onigiri.security.getToken()).toBe('new-token');
  });

  it('should add CSRF to headers', () => {
    const headers = Onigiri.security.addCSRFToHeaders({});
    expect(headers['X-CSRF-Token']).toBe('test-token');
  });

  it('should add CSRF to form data', () => {
    const data = {};
    Onigiri.security.addCSRFToData(data);
    expect(data._csrf).toBe('test-token');
  });

  it('should add CSRF to FormData', () => {
    const formData = new FormData();
    Onigiri.security.addCSRFToData(formData);
    expect(formData.get('_csrf')).toBe('test-token');
  });

  it('should sanitize HTML', () => {
    const dirty = '<script>alert("xss")</script><p>Safe</p>';
    const clean = Onigiri.security.sanitizeHTML(dirty);
    expect(clean).not.toContain('<script>');
  });

  it('should escape HTML entities', () => {
    const text = '<div>Test & "quotes"</div>';
    const escaped = Onigiri.security.escapeHTML(text);
    expect(escaped).toContain('&lt;');
    expect(escaped).toContain('&gt;');
  });

  it('should validate URLs', () => {
    expect(Onigiri.security.isValidURL('https://example.com')).toBe(true);
    expect(Onigiri.security.isValidURL('http://example.com')).toBe(true);
    expect(Onigiri.security.isValidURL('javascript:alert(1)')).toBe(false);
  });

  it('should check same origin', () => {
    expect(Onigiri.security.isSameOrigin(window.location.origin + '/path')).toBe(true);
    expect(Onigiri.security.isSameOrigin('https://other-domain.com')).toBe(false);
  });

  it('should create script with nonce', () => {
    Onigiri.security.setNonce('test-nonce');
    const script = Onigiri.security.createScript('https://cdn.example.com/script.js');
    expect(script.getAttribute('nonce')).toBe('test-nonce');
  });
});
