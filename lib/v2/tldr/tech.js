const { getArticles } = require('./utils');

const BASE_URL = 'https://tldr.tech/tech/archives';

async function getTechData(ctx) {
    ctx.state.data = {
        title: 'TLDR Newsletter - Tech & Programming',
        link: BASE_URL,
        description: 'TLDR Newsletter - Tech & Programming',
        language: 'en',
        item: await getArticles(BASE_URL, ctx),
    };
}

module.exports = async (ctx) => await ctx.cache.tryGet(BASE_URL, async () => await getTechData(ctx));
