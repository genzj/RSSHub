module.exports = function (router) {
    router.get('/tech', require('./tech'));
    router.get('/crypto', require('./crypto'));
};
