// src/helpers.js
// ==============

const {promises: Fs} = require("fs");

module.exports = {
    parsePkg: async ppath=>JSON.parse(await Fs.readFile(ppath)),
};
