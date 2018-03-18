Frontend-core
=============

Frontend core application angularjs module
An angularjs module including several modules to handle basic configuration and calling of REST API.

Features
----------
  * Authentication: login modal and JWT authentication
  * API: api caller to discover and handle call to API endpoints (REST resource or not)
  * Configuration: global configuration of core module and submodules
  * i18n: internationalization
  * Routing: base routing
  * Logging: logging of client errors to server log
  * Services: helpers to use base64, exceptions ...

Install
-------

  $ npm install https://github.com/angusyg/frontend-core --save-prod

Quick Start
-----------

After installation, js and css of module are in dist folder of module.

  $ node_modules/frontend-core/dist/frontend.core.js
  $ node_modules/frontend-core/dist/frontend.core.min.js
  $ node_modules/frontend-core/dist/frontend.core.css
