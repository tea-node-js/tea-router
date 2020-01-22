const validator = require('func-args-validator');
const Koa = require('koa');
const _ = require('lodash');
const Router = require('./lib/router');

const DEFAULT_METHODS = ['add', 'list', 'detail', 'remove', 'modify'];

const controllerChecker = (ctl, type, names) => {
  const pre = `Argument \`${type}\` validate error`;
  if (!_.isObject(ctl)) throw Error(`${pre}, controller must be a object`);
  const message = `${pre}, controller method must be an Array or a Function`;
  const typeError = Error(message);
  const nameError = Error(`${pre}, controller name must be a string`);
  const nameNotAllowError = names && Error(`${type} only need ${names.join(', ')}`);
  _.each(ctl, (methods, name) => {
    if (!_.isString(name)) throw nameError;
    if (names && names.indexOf(name) === -1) throw nameNotAllowError;
    if (!_.isArray(methods) && !_.isFunction(methods)) throw typeError;
    if (_.isFunction(methods)) return;
    _.each(methods, (method) => {
      if (!_.isArray(method) && !_.isFunction(method)) throw typeError;
      if (_.isArray(method)) {
        _.each(method, (_or) => {
          if (!_.isFunction(_or)) throw typeError;
        });
      }
    });
  });
};

module.exports = validator(Router, [{
  name: 'server',
  type: Koa,
  message: 'Argument `server` must be new Koa()',
}, {
  name: 'ctls',
  type: Object,
  validate: {
    check(values) {
      _.each(values, (ctl, key) => {
        if (!_.isString(key)) {
          throw Error(`Argument \`ctls\` must be a hash, key is string ${key}`);
        }
        controllerChecker(ctl, 'ctls');
      });
      return true;
    },
  },
}, {
  name: 'defaults',
  type: Object,
  allowNull: true,
  validate: {
    check(value) {
      controllerChecker(value, 'defaults', DEFAULT_METHODS);
      return true;
    },
  },
}, {
  name: 'opts',
  type: Object,
  allowNull: true,
  defaultValue: {},
}]);
