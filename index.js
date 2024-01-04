// index.js
// ========

const {promises: fs, existsSync} = require("fs");
const Path = require("path");

let parent_path = Path.dirname(module.parent.filename);
while(
    parent_path.length > 1
    && ! existsSync(Path.resolve(parent_path, 'package.json'))
) parent_path = Path.dirname(parent_path);
const pkg_path = Path.resolve(parent_path, 'package.json');
const modules_path = Path.resolve(parent_path, 'node_modules');

const DEFAULT_TARGET = "prod"; // prod / dev / all
const DEFAULT_PATH = "node_modules";
const DEFAULT_EXTENSION = "mjs";
const DEFAULT_CONTENT_TYPE = "application/javascript";

const parsePkg = async ppath=>JSON.parse(await fs.readFile(ppath));

async function esmCollect(router, {
    // Options:______________________
    target = DEFAULT_TARGET,
    path = DEFAULT_PATH,
    extension = DEFAULT_EXTENSION,
    content_type = DEFAULT_CONTENT_TYPE,
    warn = true,
    // ______________________________
} = {}) {

    const pkg = await parsePkg(pkg_path);
    const deps = Object.keys(pkg.dependencies || {});
    const devdeps = [...deps, ...Object.keys(pkg.devDependencies || {})];

    const selecFilters = {
        prod: p=>1+deps.indexOf(p),
        dev: p=>1+devdeps.indexOf(p),
        all: p=>true,
    };

    const allMods = await fs.readdir(modules_path);
    const selectedMods = allMods.filter(
        selecFilters[target] || selecFilters[DEFAULT_TARGET]
    );
    const mods = (await Promise.all(
        selectedMods.map(async function(modName) {
            const modPkg_path = Path.join(modules_path, modName, "package.json");
            const {browser} = await parsePkg(modPkg_path);
            switch (typeof browser) {
                case "string":

                    const filePath = Path.join(modules_path, modName, browser);
                    const routePath = Path.join("/", path, modName + "." + extension);
                    const m = {
                        name: modName,
                        path: routePath,
                    };
                    m.contents = await fs.readFile(filePath);
                    return m;
                case "undefined":
                    break;
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
    )).filter(x=>!!x); // Discarded.

    for (const m of mods) {
        router.get(m.path, function(req, res, next) {
            res.setHeader('Content-Type', content_type);
            res.send(m.contents);
        });
    };
    
};

function esmrouter(express, options) {
    const router = express.Router();
    void esmCollect(router, options);
    return router;
};

module.exports = esmrouter;
