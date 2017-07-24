'use strict';

import Koa from 'koa';
import router from './router';
import bodyParser from 'koa-bodyparser';
import cors from 'kcors';
import {} from 'dotenv/config';
import logger from './log';
import userAgent from 'koa-useragent';
import error from 'koa-json-error';

//Initialize app
const app = new Koa()

//Let's log each successful interaction. We'll also log each error - but not here,
//that's be done in the json error-handling middleware
app.use(async (ctx, next) => {
    try {
        await next();
        logger.info(ctx.method + ' ' + ctx.url + ' RESPONSE: ' + ctx.response.status)
    } catch (error) {}
})

//Apply error json handling
let errorOptions = {
    postFormat: (e, obj) => {
        //Here's where we'll stick our error logger.
        logger.info(obj)
        if (process.env.NODE_ENV !== 'production') {
            return obj
        } else {
            delete obj.stack; delete obj.name;
            return obj
        }
    }
};
app.use(error(errorOptions));

// return response time in X-Response-Time header
app.use(async function responseTime(ctx, next) {
    const t1 = Date.now();
    await next();
    const t2 = Date.now();
    ctx.set('X-Response-Time', Math.ceil(t2-t1)+'ms');
});

//For cors
app.use(cors())

//For useragent detection
app.use(userAgent);

//For managing body. We're only allowing json.
app.use(bodyParser({ enableTypes: ['json'] }));

//For router
app.use(router.routes())
app.use(router.allowedMethods());

export default app;