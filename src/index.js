// src/index.js
// ============

const {existsSync} = require("fs");

const Path = require("path");

let parent_path = Path.dirname(Path.dirname(module.parent.filename));
while(
    parent_path.length > 1
    && ! existsSync(Path.resolve(parent_path, 'package.json'))
) parent_path = Path.dirname(parent_path);
const pkg_path = Path.resolve(parent_path, 'package.json');
const modules_path = Path.resolve(parent_path, 'node_modules');

const esmCollect = require("./esmCollector")({
    pkg_path,
    modules_path,
});

function esmrouter(express, options) {
    const router = express.Router();
    void esmCollect(router, options);
    return router;
};

module.exports = esmrouter;
