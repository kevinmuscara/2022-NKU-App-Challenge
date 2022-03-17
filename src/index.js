const server = require('fastify')();
const { readFileSync } = require('fs');
const routes = require('./routes');

(async() => {
  try {
    await server.listen(80, '0.0.0.0', (err, add) => {
      if(err) console.log(err)

      console.log(add)
    })

    server.register(require('fastify-secure-session'), {
      cookieName: 'hallpass-session-cookie',
      key: readFileSync(require('path').join(__dirname, 'secret-key')),
      cookie: {
        path: '/'
      }
    });

    server.register(require('fastify-static'), {
      root: require('path').join(__dirname + '/public'),
      prefix: ''
    })

    server.register(require('point-of-view'), {
      engine: {
        ejs: require('ejs')
      },
      root: require('path').join(__dirname + '/views')
    })

    server.register(require('fastify-formbody'))

    server.register(require('fastify-multipart'))

    routes.forEach(route => server.route(route))
  } catch (err) {
    throw err
  }
})();