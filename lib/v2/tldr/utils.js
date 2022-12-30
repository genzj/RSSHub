const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getArticles(baseURL, ctx) {
    const res = await got.get(baseURL);
    const $ = cheerio.load(res.data);
    const list = $('.content-center > a').slice(0, 15);
    const articles = await Promise.all(
        list
            .map(async (_, item) => {
                const $item = $(item);
                const link = new URL($item.attr('href'), baseURL);
                return await ctx.cache.tryGet(link.href, async () => {
                    const result = await got.get(link, { throwHttpErrors: false });
                    if (result.statusCode !== 200) {
                        return null;
                    }
                    const $ = cheerio.load(result.data);
                    return {
                        title: $('title').text().trim(),
                        author: '@tldrnewsletter',
                        description: $('.content-center').html(),
                        pubDate: timezone(parseDate(link.pathname.substr(link.pathname.lastIndexOf('/') + 1), 'YYYY-MM-DD'), 0),
                        link,
                    };
                });
            })
            .toArray()
    );
    return articles.filter(Boolean);
}

module.exports = {
    getArticles,
};
