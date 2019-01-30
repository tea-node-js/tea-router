const assert = require('assert');
const Koa = require('koa');
const _ = require('lodash');
const Router = require('../');

const noop = (name, except, error) => (
  async (ctx, next) => {
    if (except) throw except;
    if (error) throw error;
    ctx.body = name;
    await next();
  }
);

const req = {
  route: {},
};

const res = {
  body: null,
};

const ctx = {
  body: res.body,
  res,
  req,
};

const next = () => {};

/* global describe it */
function mockRegister(path, methods, middleware, opts) {
  const route = {
    path,
    methods,
    middleware,
    opts,
  };

  it('path is string', () => {
    assert.ok(_.isString(path));
  });

  it('middleware is arrray, function', () => {
    _.each((m) => {
      assert.ok(_.isFunction(m));
    });
  });

  this.stack.push(route);

  return route;
}

// mockRouter
const mockRouter = (ctls, defaults, opts) => {
  const server = new Koa();

  const router = Router(server, ctls, defaults, opts);
  router.register = mockRegister;

  return router;
};

// mock ctls
const ctls = {
  user: {
    list: noop('list'),
    detail: noop('detail'),
    modify: noop('modify'),
    remove: [
      noop('remove1'),
      noop('remove2'),
      noop('remove3'),
    ],
    add: noop('add'),
  },
  company: {
    users: noop('company-list-user'),
    addUser: noop('company-add-user'),
  },
};

// mockDefaults
const defaults = {
  list: ctl => noop(`defaults-${ctl}-list`),
  detail: ctl => noop(`defaults-${ctl}-detail`),
  modify: ctl => noop(`defaults-${ctl}-modify`),
  remove: ctl => noop(`defaults-${ctl}-remove`),
  add: ctl => noop(`defaults-${ctl}-add`),
};

describe('Router usage', () => {
  describe('get', () => {
    const router = mockRouter(ctls);

    router.get('/users', 'user#list');

    it('check register result', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('list', ctx.body);
      assert.equal('/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });
  });

  describe('put', () => {
    const router = mockRouter(ctls);
    router.put('/users/:id', 'user#modify');

    it('check register result', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('put', methods[0], 'method check');
    });
  });

  describe('patch', () => {
    const router = mockRouter(ctls);
    router.patch('/users/:id', 'user#modify');

    it('check register result', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('patch', methods[0], 'method check');
    });
  });

  describe('post', () => {
    const router = mockRouter(ctls);
    router.post('/users', 'user#add');

    it('check register result', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('add', ctx.body);
      assert.equal('/users', path, 'path check');
      assert.equal('post', methods[0], 'method check');
    });
  });

  describe('del', () => {
    const router = mockRouter(ctls);
    router.del('/users/:id', 'user#remove');

    it('check register result', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);
      assert.equal('remove1', ctx.body);

      await middleware[1](ctx, next);
      assert.equal('remove2', ctx.body);

      await middleware[2](ctx, next);
      assert.equal('remove3', ctx.body);

      assert.equal('/users/:id', path, 'path check');
      assert.equal('delete', methods[0], 'method check');
    });
  });

  describe('resource path unset', () => {
    const router = mockRouter(ctls);
    router.resource('user');

    it('check register result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('list', ctx.body);
      assert.equal('/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check register result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('add', ctx.body);
      assert.equal('/users', path, 'path check');
      assert.equal('post', methods[0], 'method check');
    });

    it('check register result detail', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('detail', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check register result put modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('put', methods[0], 'method check');
    });

    it('check register result patch modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('patch', methods[0], 'method check');
    });

    it('check register result remove', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      // assert.equal('delete', ctx.body);
      assert.equal('/users/:id', path, 'path check');
      assert.equal('delete', methods[0], 'method check');
    });
  });

  describe('resource path set', () => {
    const router = mockRouter(ctls);

    router.resource('user', '/companys/users');

    it('check register result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('list', ctx.body);
      assert.equal('/companys/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check register result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('add', ctx.body);
      assert.equal('/companys/users', path, 'pach check');
      assert.equal('post', methods[0], 'method check');
    });

    it('check register result detail', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('detail', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check register result put modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('put', methods[0], 'method check');
    });

    it('check register result patch modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('patch', methods[0], 'method check');
    });

    it('check register result remove', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      // assert.equal('delete', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('delete', methods[0], 'method check');
    });
  });

  describe('collection path set has parent resource', () => {
    const router = mockRouter(ctls);
    router.collection('user', '/company/:companyId/users', 'company');

    it('check regist result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('company-list-user', ctx.body);
      assert.equal('/company/:companyId/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('company-add-user', ctx.body);
      assert.equal('/company/:companyId/users', path, 'pach check');
      assert.equal('post', methods[0], 'method check');
    });
  });

  describe('collection path unset has parent resource', () => {
    const router = mockRouter(ctls);
    router.collection('user', null, 'company');

    it('check regist result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('company-list-user', ctx.body);
      assert.equal('/companys/:companyId/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('company-add-user', ctx.body);
      assert.equal('/companys/:companyId/users', path, 'pach check');
      assert.equal('post', methods[0], 'method check');
    });
  });

  describe('collection path set has no parent resource', () => {
    const router = mockRouter(ctls);
    router.collection('user', '/company/:companyId/users');

    it('check regist result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('list', ctx.body);
      assert.equal('/company/:companyId/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('add', ctx.body);
      assert.equal('/company/:companyId/users', path, 'pach check');
      assert.equal('post', methods[0], 'method check');
    });
  });

  describe('collection path unset has no parent resource', () => {
    const router = mockRouter(ctls);
    router.collection('user');

    it('check regist result list', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('list', ctx.body);
      assert.equal('/users', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result add', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('add', ctx.body);
      assert.equal('/users', path, 'pach check');
      assert.equal('post', methods[0], 'method check');
    });
  });

  describe('model path set', () => {
    const router = mockRouter(ctls);
    router.model('user', '/companys/users/:id');

    it('check regist result detail', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('detail', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result put modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('put', methods[0], 'method check');
    });

    it('check regist result patch modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('patch', methods[0], 'method check');
    });

    it('check regist result remove', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      // assert.equal('remove', ctx.body);
      assert.equal('/companys/users/:id', path, 'pach check');
      assert.equal('delete', methods[0], 'method check');
    });
  });

  describe('model path unset', () => {
    const router = mockRouter(ctls);
    router.model('user');

    it('check regist result detail', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('detail', ctx.body);
      assert.equal('/users/:id', path, 'pach check');
      assert.equal('get', methods[0], 'method check');
    });

    it('check regist result put modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'pach check');
      assert.equal('put', methods[0], 'method check');
    });

    it('check regist result patch modify', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      assert.equal('modify', ctx.body);
      assert.equal('/users/:id', path, 'pach check');
      assert.equal('patch', methods[0], 'method check');
    });

    it('check regist result remove', async () => {
      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      await middleware[0](ctx, next);

      // assert.equal('delete', ctx.body);
      assert.equal('/users/:id', path, 'pach check');
      assert.equal('delete', methods[0], 'method check');
    });
  });

  describe('defaults controller', () => {
    const router = mockRouter(ctls, defaults);

    it('user defaults collection', async () => {
      router.collection('book');

      const layer1 = router.stack.shift();

      await layer1.middleware[0](ctx, next);

      assert.equal('defaults-book-list', ctx.body);
      assert.equal('/books', layer1.path, 'pach check');
      assert.equal('get', layer1.methods[0], 'method check');

      const layer2 = router.stack.shift();

      await layer2.middleware[0](ctx, next);

      assert.equal('defaults-book-add', ctx.body);
      assert.equal('/books', layer2.path, 'pach check');
      assert.equal('post', layer2.methods[0], 'method check');
    });

    it('user defaults model', async () => {
      router.model('book');

      const layer1 = router.stack.shift();

      await layer1.middleware[0](ctx, next);

      assert.equal('defaults-book-detail', ctx.body);
      assert.equal('/books/:id', layer1.path, 'pach check');
      assert.equal('get', layer1.methods[0], 'method check');

      const layer2 = router.stack.shift();

      await layer2.middleware[0](ctx, next);

      assert.equal('defaults-book-modify', ctx.body);
      assert.equal('/books/:id', layer2.path, 'pach check');
      assert.equal('put', layer2.methods[0], 'method check');

      const layer3 = router.stack.shift();

      await layer3.middleware[0](ctx, next);

      assert.equal('defaults-book-modify', ctx.body);
      assert.equal('/books/:id', layer3.path, 'pach check');
      assert.equal('patch', layer3.methods[0], 'method check');

      const layer4 = router.stack.shift();

      await layer4.middleware[0](ctx, next);

      // assert.equal('defaults-book-delete', ctx.body);
      assert.equal('/books/:id', layer4.path, 'pach check');
      assert.equal('delete', layer4.methods[0], 'method check');
    });
  });

  describe('router regist exceptions', () => {
    const router = mockRouter(ctls);

    it('action non-exists', () => {
      assert.throws(() => {
        router.post('/books/:bookId/order', 'book#buy');
      }, err => err instanceof Error && err.message === 'Missing controller method:book#buy');

      router.stack.shift();
    });
  });

  describe('apis defined', () => {
    it('check apis', () => {
      const router = mockRouter(ctls, null, { apis: '/_apis' });

      router.resource('user');

      const layer = router.stack.shift();

      const { path, methods } = layer;

      assert.equal('/_apis', path, 'path check');
      assert.equal('HEAD', methods[0], 'verb check');
      assert.equal('GET', methods[1], 'verb check');
    });
  });

  describe('function exec exception', () => {
    it('check throw Errror', async () => {
      const router = mockRouter({
        user: {
          detail: noop('user-detail', Error('Has error')),
        },
      });

      router.get('/user/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Has error', err.message);
      }

      assert.equal('/user/:id', path, 'path check');
      assert.equal('get', methods[0], 'path check');
    });
  });

  describe('logic or test', () => {
    it('logic or last one passed', async () => {
      const router = mockRouter({
        user: {
          detail: [
            [
              noop('logic-or-1', null, Error('Not allowed')),
              noop('logic-or-2', null, Error('Not allowed')),
              noop('logic-or-3'),
            ],
          ],
        },
      });
      router.get('/users/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      assert.equal('/users/:id', path, 'path check');

      assert.ok(middleware instanceof Array);
      assert.equal(1, middleware.length);
      assert.ok(middleware[0] instanceof Function);
      assert.equal('get', methods[0], 'verb check');

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Not allowed', err.message);
      }
    });

    it('logic or no passed', async () => {
      const router = mockRouter({
        user: {
          detail: [
            [
              noop('logic-or-1', null, Error('Not allowed 1')),
              noop('logic-or-2', null, Error('Not allowed 2')),
              noop('logic-or-3', null, Error('Not allowed 3')),
            ],
          ],
        },
      });
      router.get('/users/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      assert.equal('/users/:id', path, 'path check');
      assert.ok(middleware instanceof Array);
      assert.equal(1, middleware.length);
      assert.ok(middleware[0] instanceof Function);
      assert.equal('get', methods[0], 'verb check');

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Not allowed 1', err.message);
      }
    });

    it('logic or first passed', async () => {
      const router = mockRouter({
        user: {
          detail: [
            [
              noop('logic-or-1'),
              noop('logic-or-2', null, Error('Not allowed 2')),
              noop('logic-or-3', null, Error('Not allowed 3')),
            ],
          ],
        },
      });
      router.get('/users/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      assert.equal('/users/:id', path, 'path check');
      assert.ok(middleware instanceof Array);
      assert.equal(1, middleware.length);
      assert.ok(middleware[0] instanceof Function);
      assert.equal('get', methods[0], 'verb check');

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Not allowed 2', err.message);
      }
    });

    it('logic or 2th passed', async () => {
      const router = mockRouter({
        user: {
          detail: [
            [
              noop('logic-or-1', null, Error('Not allowed 1')),
              noop('logic-or-2'),
              noop('logic-or-3', null, Error('Not allowed 3')),
            ],
          ],
        },
      });
      router.get('/users/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      assert.equal('/users/:id', path, 'path check');
      assert.ok(middleware instanceof Array);
      assert.equal(1, middleware.length);
      assert.ok(middleware[0] instanceof Function);
      assert.equal('get', methods[0], 'verb check');

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Not allowed 1', err.message);
      }
    });

    it('logic or exec exceptions', async () => {
      const router = mockRouter({
        user: {
          detail: [
            [
              noop('logic-or-1', null, Error('Not allowed 1')),
              noop('logic-or-2', Error('Has exception')),
              noop('logic-or-3', null, Error('Not allowed 3')),
            ],
          ],
        },
      });
      router.register = mockRegister;
      router.get('/users/:id', 'user#detail');

      const layer = router.stack.shift();

      const { path, middleware, methods } = layer;

      assert.equal('/users/:id', path, 'path check');
      assert.ok(middleware instanceof Array);
      assert.equal(1, middleware.length);
      assert.ok(middleware[0] instanceof Function);
      assert.equal('get', methods[0], 'verb check');

      try {
        await middleware[0](ctx, next);
      } catch (err) {
        assert.ok(err instanceof Error);
        assert.equal('Has exception', err.message);
      }
    });
  });
});
