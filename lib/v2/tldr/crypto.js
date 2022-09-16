const { getArticles } = require('./utils');

const BASE_URL = 'https://tldr.tech/crypto/newsletter';

async function getCryptoData(ctx) {
    ctx.state.data = {
        title: 'TLDR Newsletter - Crypto',
        link: BASE_URL,
        description: 'TLDR Newsletter - Crypto',
        language: 'en',
        item: await getArticles(BASE_URL, ctx),
    };
}

module.exports = async (ctx) => await ctx.cache.tryGet(BASE_URL, async () => await getCryptoData(ctx));
