'use strict';

const introspector = require('./lib/introspector');
const generator = require('./lib/generator');
const types = require('./lib/types');

module.exports = Object.assign({}, introspector, generator, types);
