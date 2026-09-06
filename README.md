# OnigiriJS 🍙

**OnigiriJS** is a lightweight, modular JavaScript framework designed for building reactive UI components, utilities, and secure front-end features — with a strong focus on simplicity, performance, and HumHub integration.

It provides a modern, dependency-free alternative to heavy frameworks while remaining flexible enough for real-world applications.

🌐 Demo & Docs: https://onigirijs.com/

## ✨ Features

- ⚛️ **Reactive Components** with lifecycle hooks
- 🧠 **Computed properties & watchers**
- 🔐 **Security helpers** (CSRF, token handling)
- 🔄 **AJAX utilities** with auto-CSRF injection
- 📡 **Realtime SSE communication** with automatic reconnection
- 💾 **Storage helpers** (local/session storage)
- 🧩 **Event system**
- ✅ **Form validation**
- 🎞 **Animation helpers**
- 🧱 **HumHub-friendly architecture**
- 📦 **Modular – load only what you need**

No build step required.

## 📦 Installation

### npm

Install OnigiriJS using npm:

```bash
npm install @onigirijs/onigirijs
```

📦 [View OnigiriJS on npm](https://www.npmjs.com/package/@onigirijs/onigirijs)

### CDN

OnigiriJS is currently distributed via **jsDelivr**.
You can include individual modules as needed.

### Core (required)

```html
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/core/onigiri-core.js"></script>
```

### Optional Modules

```html
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/events/onigiri-events.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/components/onigiri-components.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/security/onigiri-security.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/ajax/onigiri-ajax.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/storage/onigiri-storage.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/validation/onigiri-validation.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/animate/onigiri-animate.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/pjax/onigiri-pjax.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/humhub/onigiri-humhub.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/plugins/onigiri-plugins.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/emojis/onigiri-emojis.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/portal/onigiri-portal.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/router/onigiri-router.js"></script>
<script src="https://cdn.jsdelivr.net/gh/OnigiriJS/onigirijs@main/src/framework/realtime/onigiri-realtime.js"></script>
```

> ℹ️ Load order matters — always load `onigiri-core.js` first.

## 🧪 Demo

A full demo showcasing components, animations, storage, security, and validation is available at:

👉 [OnigiriJS Shop Demo](https://onigirijs.com/shop/)

## 🛣 Roadmap

* [x] 📦 npm package
* [x] 🧪 Test suite
* [x] 📘 API reference docs
* [x] 🔌 Plugin system
* [x] ⚡ Performance optimizations

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

BSD-3-Clause license © OnigiriJS Framework

---

Built with simplicity in mind — just like a good onigiri 🍙
