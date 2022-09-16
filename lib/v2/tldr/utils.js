const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

async function getArticles(baseURL, ctx) {
    const res = await got.get(baseURL);
    const $ = cheerio.load(res.data);
    const list = $('#doc-container .row .mt-2 a');
    return await Promise.all(
        list
            .map(async (_, item) => {
                const $item = $(item);
                const link = new URL($item.attr('href'), baseURL);
                return await ctx.cache.tryGet(link.href, async () => {
                    const result = await got.get(link);
                    const $ = cheerio.load(result.data);
                    return {
                        title: $('title').text().trim(),
                        author: $('meta[name="author"]').attr('content'),
                        description: $('#doc-container .text-center div:last-child').html(),
                        pubDate: timezone(parseDate($('meta[property="article:published_time"]').attr('content'), 'YYYY-MM-DD'), 0),
                        link,
                    };
                });
            })
            .toArray()
    );
}

module.exports = {
    getArticles,
};
