// Src/esmCollector.js
// ===================

const DEFAULT_TARGET = "prod";
const {promises: Fs} = require("fs");
const Path = require("path");
const {parsePkg} = require("./helpers");

module.exports = function esmCollector_factory({
    pkg_path,
    modules_path,
}) {

    return async function esmCollect(router, {
        // Options:__________________________________________
        target          = DEFAULT_TARGET, // prod / dev / all
        include         = [],
        path            = "node_modules",
        extension       = "mjs",
        content_type    = "application/javascript",
        warn            = true,
        local_importmap = "importmap",
        local_imports   = false,
        // __________________________________________________
    } = {}) {

        const selectedMods = await getTargettedMods(target);
        if (! (include instanceof Array)) include = [include];

        const mods = (await Promise.all(
            selectedMods.map(async function(modName) {
                const modPkg_path = Path.join(modules_path, modName, "package.json");
                let {browser, main} = await parsePkg(modPkg_path);
                switch (typeof browser) {
                    case "undefined":
                        for (
                            let includePattern of include
                        ) if (
                            includePattern instanceof RegExp ? modName.match(includePattern)
                            : modName === includePattern // Exact package name
                        ) {
                            // Accept main (if defined) as failback for browser
                            browser = main;
                        };
                        if (! browser) break;
                    case "string":
                        const filePath = Path.join(modules_path, modName, browser);
                        const routePath = Path.join("/", path, modName + "." + extension);
                        const m = {
                            name: modName,
                            path: routePath,
                        };
                        m.contents = await Fs.readFile(filePath);
                        return m;
                    default:
                        if (warn) console.warn([
                            "ESMROUTER Warning:",
                            `Unsupported package.browser type (${typeof browser}).`,
                            `Module: ${modName}.`,
                            "HINT: Use {warn: false} option to avoid this message."
                        ].join(" "));
                };
                return false;
            })
        )).filter(x=>!!x); // Not discarded.

        const imports = {};

        for (const m of mods) {
            imports[m.name] = m.path;
            router.get(m.path, function(req, res, next) {
                res.setHeader('Content-Type', content_type);
                res.send(m.contents);
            });
        };
        const importmap = JSON.stringify({imports});

        // Importmap middleware:
        if (local_imports || local_importmap) {
            router.use(function(req, res, next) {
                Object.assign(res.locals, {
                    ...(local_imports
                        ? {[local_imports]: imports}
                        : {}
                    ),
                    ...(local_importmap
                        ? {[local_importmap]: importmap}
                        : {}
                    ),
                });
                next();
            });
        };

    };

    async function getTargettedMods(target) {
        const pkg = await parsePkg(pkg_path);
        const deps = Object.keys(pkg.dependencies || {});
        const devdeps = [...deps, ...Object.keys(pkg.devDependencies || {})];

        const selecFilters = {
            prod: p=>1+deps.indexOf(p),
            dev: p=>1+devdeps.indexOf(p),
            all: p=>true,
        };

        const selectedFilter = selecFilters[target] || selecFilters[DEFAULT_TARGET];

        const allModsAndScopes = await Fs.readdir(modules_path);
        const allMods = (await Promise.all(allModsAndScopes.map(
            async dirName=>(
                dirName[0] !== "@" ? dirName
                : (await Fs.readdir(Path.join(modules_path, dirName)))
                    .map(moduleName => `${dirName}/${moduleName}`)
            )
        ))).flat();

        return allMods.filter(selectedFilter);
    };

};

