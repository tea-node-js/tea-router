const assert = require('assert');
const Koa = require('koa');
const Router = require('../');

const noop = async (ctx, next) => {
  await next();
};

const ctls = {
  list: noop,
  detail: noop,
  modify: noop,
  remove: noop,
  add: noop,
};

const server = new Koa();

/* global describe it */
describe('Router init', () => {
  describe('Argument server error', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router({});
      }, err => err instanceof Error && err.message === 'Argument `server` must be new Koa()');
      done();
    });

    it('chainning type error', (done) => {
      assert.throws(() => {
        Router.server({}).exec();
      }, err => err instanceof Error && err.message === 'Argument `server` must be new Koa()');
      done();
    });
  });

  describe('Argument ctls error', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router(server, 'hello');
      }, err => err instanceof Error && err.message === 'Argument `ctls` type must be `Object`');
      done();
    });

    it('controller type error', (done) => {
      assert.throws(() => {
        Router(server, { user: 'hello' });
      }, err => err instanceof Error && err.message === 'Argument `ctls` validate error, controller must be a object');
      done();
    });

    it('chainning type error', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: { modify: noop } }).defaults('hello').exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` type must be `Object`');
      done();
    });

    it('ctls input array', (done) => {
      assert.throws(() => {
        Router.server(server).ctls(['hello', 'world']).exec();
      }, err => err instanceof Error && err.message === 'Argument `ctls` must be a hash, key is string 0');
      done();
    });

    it('ctls controller input array', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ['hello', 'world'] }).exec();
      }, err => err instanceof Error && err.message === 'Argument `ctls` validate error, controller name must be a string');
      done();
    });


    it('ctls controller methods string', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: { modify: 'hello' } }).exec();
      }, err => err instanceof Error && err.message === 'Argument `ctls` validate error, controller method must be an Array or a Function');
      done();
    });

    it('ctls controller methods array string', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: { modify: ['hello'] } }).exec();
      }, err => err instanceof Error && err.message === 'Argument `ctls` validate error, controller method must be an Array or a Function');
      done();
    });
  });

  describe('Argument defaults error', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router(server, { user: { modify: noop } }, 'hello');
      }, err => err instanceof Error && err.message === 'Argument `defaults` type must be `Object`');
      done();
    });

    it('chainning type error', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: { modify: noop } }).defaults('hello').exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` type must be `Object`');
      done();
    });

    it('defaults controller input array', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).defaults(['hello world']).exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` validate error, controller name must be a string');
      done();
    });

    it('defaults controller methods string', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).defaults({ detail: 'hello world' }).exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` validate error, controller method must be an Array or a Function');
      done();
    });

    it('defaults controller methods array string', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).defaults({ detail: ['hello world'] }).exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` validate error, controller method must be an Array or a Function');
      done();
    });

    it('defaults controller method name not allowed', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).defaults({ name: noop }).exec();
      }, err => err instanceof Error && err.message === 'defaults only need add, list, detail, remove, modify');
      done();
    });
  });

  describe('Argument opts error', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).opts('hello').exec();
      }, err => err instanceof Error && err.message === 'Argument `opts` type must be `Object`');
      done();
    });
  });

  describe('Argument ctls logic or error', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({
          user: {
            detail: [
              [noop, noop, 'hello'],
            ],
          },
        }).exec();
      }, err => err instanceof Error && err.message === 'Argument `ctls` validate error, controller method must be an Array or a Function');
      done();
    });
  });

  describe('Argument defaults type error in array', () => {
    it('type error', (done) => {
      assert.throws(() => {
        Router.server(server).ctls({ user: ctls }).defaults({
          detail: [noop, noop, 'hello'],
        }).exec();
      }, err => err instanceof Error && err.message === 'Argument `defaults` validate error, controller method must be an Array or a Function');
      done();
    });
  });
});
