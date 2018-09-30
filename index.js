/*
 * SProxy Server
 * Proxy Server for redirecting data from request to another server for sake of security and used during server side whitelisting
 * 
 * @author : Bismay <bismay@smartinfologiks.com>
 * */

const config = require('./config');
const proxyConfig = require('./proxy');

/**
 * Loading all plugin packages required
 */
const restify = require('restify');
const restifyPlugins = require('restify-plugins');
const errors = require('restify-errors');

const fs = require('fs');
const bunyan = require('bunyan');
const _ = require('lodash');

//Need require-live

/**
 * Create A Logger, may be we will remove this in future
 */
const logger = bunyan.createLogger({
    name: config.name,
    streams: [{
        level: 'error',
        path: './logs/error.log' // log ERROR and above to a file
    }]
});

/**
 * Initialize Server
 */
const server = restify.createServer({
    name: config.name,
    version: config.version,

    dtrace: false,
    log: logger,
    ignoreTrailingSlash: true
});
server.config = config;
server.proxyConfig = proxyConfig;

/**
 * Preeware
*/
server.pre(restify.plugins.pre.context());
server.pre(restify.plugins.pre.dedupeSlashes());
server.pre(restify.plugins.pre.sanitizePath());

/**
 * Middleware
*/
server.use(restify.plugins.urlEncodedBodyParser());
server.use(restify.plugins.queryParser({ mapParams: true }));//req.query
server.use(restify.plugins.acceptParser( server.acceptable ));
server.use(restify.plugins.dateParser());
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.throttle( config.throttle ));

//Landing Page
server.get('/', (req, res) => {
    res.sendRaw('Welcome to '+server.config.name);
})

//With ProxyKEY
server.get('/:proxykey', (req, res, next) => {
    processProxyRequest("GET",req.path(),req, res, next);
});

server.post('/:proxykey', (req, res, next) => {
    processProxyRequest("POST",req.path(),req, res, next);
});

server.put('/:proxykey', (req, res, next) => {
    processProxyRequest("PUT",req.path(),req, res, next);
});

server.del('/:proxykey', (req, res, next) => {
    processProxyRequest("DELETE",req.path(),req, res, next);
});

server.get('/:proxykey/*', (req, res, next) => {
    processProxyRequest("GET",req.path(),req, res, next);
});

server.post('/:proxykey/*', (req, res, next) => {
    processProxyRequest("POST",req.path(),req, res, next);
});

server.put('/:proxykey/*', (req, res, next) => {
    processProxyRequest("PUT",req.path(),req, res, next);
});

server.del('/:proxykey/*', (req, res, next) => {
    processProxyRequest("DELETE",req.path(),req, res, next);
});

/**
 * Start Server, Checks for availale PORTs
 */
server.listen(config.port, () => {
    console.log(`${server.config.name} is listening on port ${config.port}`);
});


function processProxyRequest(type, path, req, res, next) {
    proxyKEY = req.params.proxykey;

    if(server.proxyConfig[proxyKEY]==null) {
        res.send("Not Found");
        return next();
    }

    if(req.query.debug != null && req.query.debug=="true") {
        res.send({
            "proxykey":proxyKEY,
            "type":type,
            "path":path,
            "params":req.params,
            "query":req.query,
            "body":req.body,
            "headers":req.headers,
        });
        return next();
    }

    //PATH
    //GET
    //BODY
    //HEADERS (As per settings for the key)
    
    res.send("OK");
    next();
}