const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const BASE_URL = 'https://tldr.tech/newsletter';
const DATE_DESC_SEP = ' - ';

async function getTechData(ctx) {
    const res = await got.get(BASE_URL);
    const $ = cheerio.load(res.data);
    const list = $('#doc-container .row .mt-2 a');
    const articles = await Promise.all(
        list
            .map(async (_, item) => {
                const $item = $(item);
                const title = $item.text().trim();
                const sepIndex = title.indexOf(DATE_DESC_SEP);
                const link = new URL($item.attr('href'), BASE_URL);
                const content = await ctx.cache.tryGet(link.href, async () => {
                    const result = await got.get(link);
                    const $ = cheerio.load(result.data);
                    return $('#doc-container .text-center div').html();
                });

                return (
                    content && {
                        title,
                        author: 'TLDR',
                        description: content,
                        pubDate: timezone(parseDate(title.slice(0, sepIndex), 'YYYY-MM-DD'), 0),
                        link,
                    }
                );
            })
            .toArray()
    );
    ctx.state.data = {
        title: 'TLDR每日技术与编程类新闻摘要',
        link: BASE_URL,
        description: 'TLDR每日技术与编程类新闻摘要',
        language: 'en',
        item: articles,
    };
}

module.exports = async (ctx) => await ctx.cache.tryGet(BASE_URL, async () => await getTechData(ctx));
