# ESMrouter

Express router to export ESM npm packages.

[![NPM Version][npm-image]][npm-url]
[![npm dependents](https://badgen.net/npm/dependents/esmrouter)](https://www.npmjs.com/package/esmrouter?activeTab=dependents)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)


# Brief

ESMrouter creates an Express router that makes all [browser-enabled npm
packages](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#browser)
installed trough `npm install` automatically available client side by its
package name.


**Example:**

  * In your project: `npm install my_package`
  * In your client app: `import my_package from my_package`


# Index

<!-- vim-markdown-toc GitLab -->

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Quick Start](#quick-start)
    * [Creating a new Expres project:](#creating-a-new-expres-project)
    * [Adding ESMrouter to existing express projects](#adding-esmrouter-to-existing-express-projects)
* [Options](#options)
    * [target](#target)
    * [include](#include)
    * [path](#path)
    * [extension](#extension)
    * [content_type](#content_type)
    * [warn](#warn)
    * [local_importmap](#local_importmap)
    * [local_imports](#local_imports)
* [License](#license)
* [Acknowledgements](#acknowledgements)

<!-- vim-markdown-toc -->

# Features

  * Automatically serve all [browser-enabled NPM
    packages](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#browser)
    making them available client side.

  * Provide an *importmap* local that can be used to provide a fully automated
    [importmap](https://byteofdev.com/posts/how-to-use-esm/#import-maps) in
    your layout view's head so that **you can import npm packages just by its
    package name** client side.

  * [Easy to set up!](#quick-start).

  * Then just *npm install* modules in your project and **import them by its
    name client side**.

  * Highly customisable. Even though defaults will be just fine in almost all
    cases.


# Installation

```sh
npm install esmrouter
```

# Usage

Load esmrouter:

```javascript
const esmrouter = require('esmrouter');
```

Create an express router to serve all installed packages:

```javascript
const modulesRouter = esmrouter(express, options);
```
Where:

  * *express:* The express utility framework you already have installed.

  * *options:* An (optional) options object (see the [Options](#options)
    section).

Mount it to your express app:

```javascript
app.use(modulesRouter);
```


# Quick Start

Following are more step by step instructions to get it working from scratch
with simple express project:

## Creating a new Expres project:

1. Create an express project with [xprgen](https://www.npmjs.com/package/xprgen) and `--esmr` modifier:

```sh
npx xprgen --esmr myApp
cd myApp
npm install
```


2. You're done!!

…just *npm install* your *browser-enabled* packages and import them by its package name client side.

To see them working just start your new server in dev mode (so you don't need to restart it at every change):

```sh
DEBUG=myapp:* npm run dev
```


**Example:**

Install the *smarkform* npm package:

```sh
npm install smarkform
```

Edit any view (i.e. 'views/index.pug') and append the following code:

```javascript
  script(type="module").
    import smarkform from "smarkform";
    console.log(smarkform);
```

Now, if you connect to http://localhost:3000 and open the
develpoer console (usually by hitting `<F12>` key), you'll confirm that the module was successfully loaded.


## Adding ESMrouter to existing express projects

1. Go to your existing Express project directory (say *./myApp):

```sh
cd myApp
```

2. Install **esmrouter**

```sh
npm install esmrouter
```

3. Create a file at 'routes/node_modules.js' with following contents:

```javascript
const express = require('express');
const esmrouter = require('esmrouter');

const modules_options = {
    warn: false,
}

const router = esmrouter(express, modules_options);

module.exports = router;
```

4. Edit the 'app.js' file and add the following lines just after the `var app =
   express();` line:


```javascript
const modulesRouter = require('./routes/node_modules');
app.use(modulesRouter);
```


5. Edit the default layout template (say 'views/layout.pug' in case you use Pug as your template engine) and add the following line in the *head* section:

```pug
    script(type='importmap')!=importmap
```

This maka all templates using this layout to load the importmap file generated by ESMrouter that will allow you to import *browser-enabled* npm packages just by their package name instead of their actual route (/node_modules/&lt;package_name&gt; by default).


**That's All!!**

Now you can *npm install* your preferred ESM packages from npm and import them
in all your project views by its package name (as long as they use that layout file) without any extra bundling/compilation step...


# Options

## target

Control which modules are checked.

   - Valid options:
     * `prod`: Scan production dependencies only.
     * `dev`: Like "prod", but also include devDependencies.
     * `all` Scan all modules under node_modules, including sub-dependencies.
   - Default value: "prod".


## include

Allow to include packages without [browser
field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#browser)
defined using *main field* as entry point.

  - Valid options:
    * A string containing an exact package name to be included.
    * A RegExp that package name must satisfy to be included.
    * An array with many of the former.
  - Default value: `[]`
  - Examples:
    * `/\bwc-/` Include all scoped and non-scoped packages whose name begins
       with "wc-" (standing for "Web Component"). 


## path

Specify the base for the route path of all served modules.

   - Default value: "node_modules".
   - Can be empty ("") to mount all at the root of the router.


## extension

Specify the file extension for the route path of all served modules.

   - Default value: "mjs"


## content_type

Specify the value of the content-type header.

   - Default value: "application/javascript"


## warn

Specify wether to warn or not when a package with a non string "browser"
property in its package.json is found.

   - Default value: true.
   - Note: Warning message also provide a hint to disable it.

## local_importmap

Defines the name of the local property where the importmap string is provided
(falsy value disables it).

   - Default value: "importmap".


## local_imports

Defines the name of the local property where the imports object is provided
(falsy value disables it).

   - Default value: false (disabled).


# License

  [MIT](LICENSE)


# Acknowledgements

We would like to express our gratitude to the open source community for their valuable contributions and feedback.


[npm-image]: https://img.shields.io/npm/v/esmrouter.svg
[npm-url]: https://npmjs.org/package/esmrouter
