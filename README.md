# ESMrouter

Express router to export ESM npm packages.

# Index

<!-- vim-markdown-toc GitLab -->

* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
* [Quick Start](#quick-start)
* [Options](#options)
    * [target](#target)
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

  * Automatically serve all npm packages that export ESM modules (through the
    *browser* property in its package.json).

  * Provide an *importmap* local that can be used to provide a fully automated
    [importmap](https://byteofdev.com/posts/how-to-use-esm/#import-maps) in
    your layout view's head so that **you can import npm packages just by its
    package name** client side.

  * Easy to set up. Then just *npm install* browser-enabled packages to get
    them available client side.

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

1. Create an express project with your preferred template engine (we'll use
[pug](https://pugjs.org) for our example):

```sh
npx express-generator -v pug myApp
cd myApp
npm install
```

> 💡 **HINT:** Following instructions are there for the sake of explanation. If
> you are going to create a new Express project, there is a modified version of
> *express-generator* that can do all the work for you.
> 
>   * To install it:
>     ```sh
>     npm install -g https://github.com/bitifet/express-generator.git#esmrouter_support
>     ```
>   * Then, add the `--esmr` switch and you're done!
>     ```sh
>     express --view pug --esmr myApp
>     ```


Now you can check that it works:

```sh
DEBUG=myapp:* npm start
```

And then press *Ctrl+C* to stop it and continue...


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


5. Edit the default layout template at 'views/layout.pug' and add the following
   line in the *head* section:

```pug
    script(type='importmap')!=importmap
```

**That's All!!**

Now you can *npm install* your preferred ESM packages from npm and import them
in all your project views without any bundling/compilation step...

**Example:**


Install the smarkform npm package:

```sh
npm install smarkform
```

Edit any view (i.e. 'views/index.pug') and append the following code:

```javascript
  script(type="module").
    import smarkform from "smarkform";
    console.log(smarkform);
```

Now, if you start the server, connect to http://localhost:3000 and open the
develpoer console, you would confirm that the module was successfully loaded:


```sh
DEBUG=myapp:* npm start
```


# Options

## target

Control which modules are checked.

   - Valid options: "prod" (for production dependencies only),
     "dev" (to also include devDependencies) or "all" (for all
     modules under node_modules, including sub-dependencies).
   - Default value: "prod".

## path

Specify the base for the route path of all served modules.

   - Default value: "node_modules".
   - Can be empty ("") to mount all at the root of the router.


## extension

Specify the file extension for the route path of all served modules.

   - Default values: "mjs"


## content_type

Specify the value of the content-type header.

   - Default values: "application/javascript"


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

