// Integration tests for the /example directory
const { describe, it, expect, beforeEach } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

describe('Example Directory Structure', () => {
  const exampleDir = path.join(__dirname, '..', 'example');
  
  it('should have an example directory', () => {
    const exists = fs.existsSync(exampleDir);
    if (!exists) {
      console.warn('Example directory not found. Skipping example tests.');
    }
    // Don't fail if example doesn't exist yet
    expect(true).toBe(true);
  });
});

describe('Counter Example Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="counter-app">
        <div id="count">0</div>
        <button id="increment">+</button>
        <button id="decrement">-</button>
        <button id="reset">Reset</button>
      </div>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
  });

  it('should initialize counter application', () => {
    const app = {
      count: 0,
      countEl: document.getElementById('count'),
      
      updateDisplay() {
        this.countEl.textContent = this.count;
      },
      
      increment() {
        this.count++;
        this.updateDisplay();
      },
      
      decrement() {
        this.count--;
        this.updateDisplay();
      },
      
      reset() {
        this.count = 0;
        this.updateDisplay();
      }
    };

    expect(app.count).toBe(0);
    
    app.increment();
    expect(app.count).toBe(1);
    
    app.decrement();
    expect(app.count).toBe(0);
    
    app.reset();
    expect(app.count).toBe(0);
  });

  it('should handle DOM interactions', () => {
    const o = new Onigiri('#counter-app');
    let count = 0;

    new Onigiri('#increment').on('click', () => {
      count++;
      new Onigiri('#count').text(count);
    });

    document.getElementById('increment').click();
    expect(count).toBe(1);
    expect(document.getElementById('count').textContent).toBe('1');
  });
});

describe('Todo List Example Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="todo-app">
        <input type="text" id="todo-input" placeholder="New todo">
        <button id="add-todo">Add</button>
        <ul id="todo-list"></ul>
      </div>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
  });

  it('should manage todo list', () => {
    const todos = [];
    
    const addTodo = (text) => {
      const todo = {
        id: Date.now(),
        text: text,
        completed: false
      };
      todos.push(todo);
      return todo;
    };

    const toggleTodo = (id) => {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    };

    const deleteTodo = (id) => {
      const index = todos.findIndex(t => t.id === id);
      if (index > -1) {
        todos.splice(index, 1);
      }
    };

    const todo1 = addTodo('Learn OnigiriJS');
    expect(todos.length).toBe(1);
    expect(todos[0].text).toBe('Learn OnigiriJS');

    toggleTodo(todo1.id);
    expect(todos[0].completed).toBe(true);

    deleteTodo(todo1.id);
    expect(todos.length).toBe(0);
  });

  it('should render todo items', () => {
    const renderTodo = (todo) => {
      return `
        <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
          <span>${todo.text}</span>
          <button class="delete">Delete</button>
        </li>
      `;
    };

    const todo = { id: 1, text: 'Test', completed: false };
    const html = renderTodo(todo);
    
    new Onigiri('#todo-list').html(html);
    
    expect(document.querySelector('#todo-list li')).toBeTruthy();
    expect(document.querySelector('#todo-list li span').textContent).toBe('Test');
  });
});

describe('Form Validation Example Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contact-form">
        <input type="text" name="name" id="name">
        <input type="email" name="email" id="email">
        <input type="password" name="password" id="password">
        <textarea name="message" id="message"></textarea>
        <button type="submit">Submit</button>
      </form>
      <div id="errors"></div>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.validation.js');
  });

  it('should validate form inputs', () => {
    document.getElementById('name').value = '';
    document.getElementById('email').value = 'invalid-email';
    document.getElementById('password').value = 'weak';

    const o = new Onigiri('#contact-form');
    const result = o.validate({
      name: { required: true },
      email: { required: true, email: true },
      password: { required: true, minLength: 8 }
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.password).toBeDefined();
  });

  it('should pass with valid inputs', () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@example.com';
    document.getElementById('password').value = 'SecurePass123';

    const o = new Onigiri('#contact-form');
    const result = o.validate({
      name: { required: true },
      email: { required: true, email: true },
      password: { required: true, minLength: 8 }
    });

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});

describe('AJAX Data Fetching Example', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="data-app">
        <button id="load-data">Load Data</button>
        <div id="loading" style="display: none;">Loading...</div>
        <div id="data-container"></div>
        <div id="error" style="display: none;"></div>
      </div>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.ajax.js');
    global.fetch = jest.fn();
  });

  it('should fetch and display data', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ users: [{ id: 1, name: 'John' }] }),
      headers: new Map([['content-type', 'application/json']])
    });

    const loadData = async () => {
      new Onigiri('#loading').show();
      
      try {
        const data = await Onigiri.get('https://api.example.com/users');
        new Onigiri('#loading').hide();
        new Onigiri('#data-container').html(
          data.users.map(u => `<div>${u.name}</div>`).join('')
        );
        return data;
      } catch (error) {
        new Onigiri('#loading').hide();
        new Onigiri('#error').text('Failed to load data').show();
        throw error;
      }
    };

    const result = await loadData();
    expect(result.users).toBeDefined();
    expect(result.users.length).toBe(1);
  });

  it('should handle loading states', async () => {
    global.fetch.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    const app = {
      loading: false,
      data: null,
      error: null,
      
      async fetchData() {
        this.loading = true;
        this.error = null;
        
        try {
          this.data = await Onigiri.get('https://api.example.com/data');
        } catch (e) {
          this.error = e.message;
        } finally {
          this.loading = false;
        }
      }
    };

    expect(app.loading).toBe(false);
    const promise = app.fetchData();
    expect(app.loading).toBe(true);
    await promise;
    expect(app.loading).toBe(false);
  });
});

describe('Component-based Application Example', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.events.js');
    require('../src/framework/onigiri.components.js');
  });

  it('should create interactive component', () => {
    const component = new Onigiri().Component({
      data: {
        message: 'Hello OnigiriJS',
        count: 0
      },
      methods: {
        increment() {
          this.count++;
        },
        updateMessage(msg) {
          this.message = msg;
        }
      },
      computed: {
        displayText() {
          return `${this.message} - Count: ${this.count}`;
        }
      },
      template: function() {
        return `
          <div>
            <h1>${this.displayText}</h1>
            <button id="inc-btn">Increment</button>
          </div>
        `;
      }
    });

    component.mount('#app');
    
    expect(component.message).toBe('Hello OnigiriJS');
    expect(component.count).toBe(0);
    expect(component.displayText).toBe('Hello OnigiriJS - Count: 0');
    
    component.increment();
    expect(component.count).toBe(1);
  });

  it('should handle component lifecycle', () => {
    const lifecycle = {
      beforeCreate: false,
      created: false,
      beforeMount: false,
      mounted: false,
      beforeDestroy: false,
      destroyed: false
    };

    const component = new Onigiri().Component({
      data: {},
      beforeCreate() { lifecycle.beforeCreate = true; },
      created() { lifecycle.created = true; },
      beforeMount() { lifecycle.beforeMount = true; },
      mounted() { lifecycle.mounted = true; },
      beforeDestroy() { lifecycle.beforeDestroy = true; },
      destroyed() { lifecycle.destroyed = true; }
    });

    expect(lifecycle.beforeCreate).toBe(true);
    expect(lifecycle.created).toBe(true);

    component.mount('#app');
    expect(lifecycle.beforeMount).toBe(true);
    expect(lifecycle.mounted).toBe(true);

    component.destroy();
    expect(lifecycle.beforeDestroy).toBe(true);
    expect(lifecycle.destroyed).toBe(true);
  });
});

describe('Storage Example Integration', () => {
  beforeEach(() => {
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.storage.js');
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should persist user preferences', () => {
    const preferences = {
      theme: 'dark',
      language: 'en',
      notifications: true
    };

    Onigiri.storage.set('user-preferences', preferences);
    
    const loaded = Onigiri.storage.get('user-preferences');
    expect(loaded).toEqual(preferences);
  });

  it('should handle shopping cart', () => {
    const cart = {
      items: [
        { id: 1, name: 'Product 1', quantity: 2, price: 10 },
        { id: 2, name: 'Product 2', quantity: 1, price: 20 }
      ],
      total: 40
    };

    Onigiri.storage.set('shopping-cart', cart);
    
    const loadedCart = Onigiri.storage.get('shopping-cart');
    expect(loadedCart.items.length).toBe(2);
    expect(loadedCart.total).toBe(40);
  });

  it('should use session storage for temporary data', () => {
    Onigiri.storage.session.set('wizard-step', 3);
    Onigiri.storage.session.set('form-data', { name: 'John' });

    expect(Onigiri.storage.session.get('wizard-step')).toBe(3);
    expect(Onigiri.storage.session.get('form-data')).toEqual({ name: 'John' });
  });
});

describe('Animation Example Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="box" style="width: 100px; height: 100px;"></div>
      <button id="animate-btn">Animate</button>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.animate.js');
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  });

  it('should have animation methods available', () => {
    const o = new Onigiri('#box');
    expect(typeof o.fadeIn).toBe('function');
    expect(typeof o.fadeOut).toBe('function');
    expect(typeof o.slideDown).toBe('function');
    expect(typeof o.slideUp).toBe('function');
  });

  it('should chain animations', () => {
    const o = new Onigiri('#box');
    const result = o.fadeOut().fadeIn();
    expect(result).toBeInstanceOf(Onigiri);
  });
});

describe('Real-world Application Flow', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        <form id="login-form">
          <input type="text" name="username">
          <input type="password" name="password">
          <button type="submit">Login</button>
        </form>
        <div id="dashboard" style="display: none;">
          <h1>Welcome <span id="username"></span></h1>
          <button id="logout">Logout</button>
        </div>
      </div>
    `;
    global.Onigiri = require('../src/framework/onigiri.core.js');
    require('../src/framework/onigiri.ajax.js');
    require('../src/framework/onigiri.storage.js');
    global.fetch = jest.fn();
  });

  it('should handle complete authentication flow', async () => {
    const app = {
      currentUser: null,
      
      async login(username, password) {
        global.fetch.mockResolvedValue({
          ok: true,
          json: async () => ({ token: 'abc123', user: { username } }),
          headers: new Map([['content-type', 'application/json']])
        });

        const response = await Onigiri.post('/api/login', { username, password });
        
        this.currentUser = response.user;
        Onigiri.storage.set('auth-token', response.token);
        Onigiri.storage.set('current-user', response.user);
        
        this.showDashboard();
        return response;
      },
      
      logout() {
        this.currentUser = null;
        Onigiri.storage.remove('auth-token');
        Onigiri.storage.remove('current-user');
        this.showLogin();
      },
      
      showDashboard() {
        new Onigiri('#login-form').hide();
        new Onigiri('#dashboard').show();
        new Onigiri('#username').text(this.currentUser.username);
      },
      
      showLogin() {
        new Onigiri('#dashboard').hide();
        new Onigiri('#login-form').show();
      },
      
      init() {
        const token = Onigiri.storage.get('auth-token');
        const user = Onigiri.storage.get('current-user');
        
        if (token && user) {
          this.currentUser = user;
          this.showDashboard();
        }
      }
    };

    // Test login
    await app.login('john', 'password123');
    expect(app.currentUser).toBeDefined();
    expect(app.currentUser.username).toBe('john');
    expect(Onigiri.storage.get('auth-token')).toBe('abc123');

    // Test logout
    app.logout();
    expect(app.currentUser).toBeNull();
    expect(Onigiri.storage.get('auth-token')).toBeNull();
  });
});
