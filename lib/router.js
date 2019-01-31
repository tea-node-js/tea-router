const _ = require('lodash');
const Router = require('koa-router');

const ucwords = value => `${value[0].toUpperCase()}${value.substring(1)}`;

const METHODS = ['get', 'post', 'put', 'patch', 'del'];

/**
 * 路由器初始化
 * params
 * server object new Koa()
 * controller ./controller
 * defaults 默认控制器方法
 */
module.exports = (server, ctls, defaults, opts) => {
  const apis = [];

  /* 创建koa-router对象 */
  const router = new Router();

  /* 判断是否需要提供apis的查询接口 */
  if (opts.apis) {
    router.get(opts.apis, async (ctx, next) => {
      ctx.body = apis;
      await next();
    });
  }

  /* router METHODS重新hook */
  _.each(METHODS, (verb) => {
    const method = router[verb];
    router[`_${verb}`] = method;
  });

   /**
   * 执行 ors, 即只要有一个没有返回错误就算通过
   * 一般用于权限验证，比如某个操作既可以管理员
   * 又可以是资源拥有者，又可以是私有IP
   */
  const actionOrs = async (actions, ctx, next) => {
    let clientErrors = [];

    // remember ctx.res.fail
    const failResponseHandler = ctx.res.fail;

    const rewriteFailResponseHandler = (params = {}) => {
      if (params) {
        clientErrors.push(params);
      }
    };

    ctx.res.fail = rewriteFailResponseHandler;

    // make it work in koa
    const _next = async () => {};

    try {
      await Promise.all(actions.map(async (action) => await action(ctx, _next)));
    } catch (e) {
      return failResponseHandler({
        statusCode: 401,
        data: e,
        message: 'unauthorized',
      });
    }

    clientErrors = _.compact(clientErrors);

    if (clientErrors.length === actions.length) {
      return failResponseHandler({
        statusCode: 401,
        data: clientErrors.map((ce) => {
          if (ce.data instanceof Error) {
            ce.data = ce.data.message || ce.data;
          }
          return ce;
        }),
        message: 'unauthorized',
      });
    }

    // reset ctx.res.fail, make it work later
    ctx.res.fail = failResponseHandler;

    return await next();
  };

  /* 绑定路由 */
  const register = (verb, path, ctlAct) => {
    /**
     * 保存起来，提供给apis接口使用
     * apis接口用于返回当前services提供的可用的apis
     */
    apis.push(`[${verb.toUpperCase()} ${path}]`);

    const [ctl, action] = ctlAct.split('#');
    const evtName = `${ctl}_${action}`;

    let actions;

    /* 如果定义了对应的控制器, 也有对应的方法则使用该方法 */
    if (ctls[ctl] && ctls[ctl][action]) actions = ctls[ctl][action];

    /* 反之则使用默认的方法来处理 */
    if (!actions && defaults && defaults[action]) actions = defaults[action](ctl);

    /* 如果没有则抛出异常 */
    if (!actions) throw Error(`Missing controller method:${ctl}#${action}`);

    /* 强制把actions处理成一个数组 */
    if (!_.isArray(actions)) actions = [actions];

    /* 过滤掉空action */
    actions = _.compact(actions);

    /* 将每一个action都用try catch处理 */
    actions = _.map(actions, act => (
      async (ctx, next) => {
        ctx.req.route.evtName = evtName;
        try {
          if (_.isArray(act)) {
            await actionOrs(act, ctx, next);
          } else {
            await act(ctx, next);
          }
        } catch (err) {
          ctx.status = err.statusCode || err.status || 500;
          ctx.body = {
            message: err.message,
          };
        }
      }
    ));

    const args = [path].concat(actions);

    router[`_${verb}`](...args);
  };

  /* 重写METHODS */
  _.each(METHODS, (verb) => {
    router[verb] = (path, ctlAct) => {
      register(verb, path, ctlAct);
    };
  });

  /**
   * controller 为可选参数，如果不填写控制器名直接就是res，方法为list, add
   * 如果设置了controller则控制器为controller，方法为#{res}s, add{Res}
   */
  router.collection = (res, _path, controller) => {
    let path = _path;

    // _path 未设置时为undefined，undefined == null为true，
    // 而undefined === null为false
    if (_path == null) {
      if (controller) {
        path = `/${controller}s/:${controller}Id/${res}s`;
      } else {
        path = `/${res}s`;
      }
    }

    if (controller) {
      register('get', path, `${controller}#${res}s`);
      register('post', path, `${controller}#add${ucwords(res)}`);
    } else {
      register('get', path, `${res}#list`);
      register('post', path, `${res}#add`);
    }
  };

  /**
   * res针对单个model增删查改
   */
  router.model = (res, path = `/${res}s/:id`) => {
    register('get', path, `${res}#detail`);
    register('put', path, `${res}#modify`);
    register('patch', path, `${res}#modify`);
    register('del', path, `${res}#remove`);
  };

  /**
   * 将collection和model结合
   */
  router.resource = (res, path = `/${res}s`) => {
    router.collection(res, path);
    router.model(res, `${path}/:id`);
  };

  return router;
};
