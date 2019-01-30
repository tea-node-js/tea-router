# tea-router

A router for koa.

# Node version

```
>= 8
```

# Usage

```
npm install --save tea-router
```

# Example router definition

```
cont Koa = require('koa');
const Rourer = require('tea-router');

/**
 * @return router instance
 *
 * @params server
 *     new Koa() return result
 * @params controllers
 *     All controllers object,
 *      {
 *        controllerName: {
 *          methodName: method
 *        }
 *      }
 * @params defaultCtl
 *    {
 *      list: function() {},
 *      modify: function() {},
 *      detail: function() {},
 *      remove: function() {},
 *      add: function() {}
 *    }
 * @params opts
 *          apis The uri list all rest api;
 */
const server = new Koa();
const router = Router(server, controllers, defaultCtl, opts);

```

# Methods

## router[get|post|del|put|patch](path, ctlAct)

```
router.get('/users', 'user#list')
router.post('/users', 'user#addUser')
router.get('/users/:userId', 'user#detail')
router.del('/users/:userId', 'user#remove')
router.put('/users/:userId', 'user#modify')
router.post('/users/:userId', 'user#modify')
```

## router.resource(name, path)

```
router.resource('user')

// Equivalent to
// router.get('/users', 'user#list');
// router.get('/users/:id', 'user#detail');
// router.put('/users/:id', 'user#modify');
// router.patch('/users/:id', 'user#modify');
// router.delete('/users/:id', 'user#remove');
// router.post('/users', 'user#add');
```

## router.model(name, path) 

```
router.model('user')

// Equivalent to
// router.get('/users/:id', 'user#detail');
// router.put('/users/:id', 'user#modify');
// router.patch('/users/:id', 'user#modify');
// router.delete('/users/:id', 'user#remove');

router.model('user', '/systems/users')

// Equivalent to
// router.get('/systems/users/:id', 'user#detail');
// router.put('/systems/users/:id', 'user#modify');
// router.patch('/systems/users/:id', 'user#modify');
// router.delete('/systems/users/:id', 'user#remove');
```

## router.collection(name, path)

```
router.collection('book', null, 'user')

// Equivalent to

// router.get('/users/:userId/books', 'user#books');
// router.post('/users/:userId/books', 'user#addBook');

router.collection('book', '/users/:creatorId/books', 'user')

// Equivalent to

// router.get('/users/:creatorId/books', 'user#books');
// router.post('/users/:creatorId/books', 'user#addBook');
```
