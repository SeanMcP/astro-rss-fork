import { XMLValidator } from "fast-xml-parser";
import { createCanonicalURL, isValidURL } from "./util.js";
function isGlobResult(items) {
    return typeof items === "object" && !items.length;
}
function mapGlobResult(items) {
    return Promise.all(Object.values(items).map(async (getInfo) => {
        // Begin fork
        const { url, frontmatter, file, compiledContent } = await getInfo();
        // End Fork
        if (!Boolean(url)) {
            throw new Error(`[RSS] When passing an import.meta.glob result directly, you can only glob ".md" files within /pages! Consider mapping the result to an array of RSSFeedItems. See the RSS docs for usage examples: https://docs.astro.build/en/guides/rss/#2-list-of-rss-feed-objects`);
        }
        if (!Boolean(frontmatter.title) || !Boolean(frontmatter.pubDate)) {
            throw new Error(`[RSS] "${url}" is missing a "title" and/or "pubDate" in its frontmatter.`);
        }
        return {
            link: url,
            title: frontmatter.title,
            pubDate: frontmatter.pubDate,
            description: frontmatter.description,
            customData: frontmatter.customData,
            // Begin fork
            content: file.slice(-3) === ".md" ? compiledContent() : undefined,
            isDraft: frontmatter.draft === true,
            // End fork
        };
    }));
}
export default async function getRSS(rssOptions) {
    const { site } = rssOptions;
    let { items } = rssOptions;
    if (!site) {
        throw new Error('[RSS] the "site" option is required, but no value was given.');
    }
    if (isGlobResult(items)) {
        items = await mapGlobResult(items);
    }
    return {
        body: await generateRSS({
            rssOptions,
            items,
        }),
    };
}
/** Generate RSS 2.0 feed */
export async function generateRSS({ rssOptions, items, }) {
    const { site } = rssOptions;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    if (typeof rssOptions.stylesheet === "string") {
        xml += `<?xml-stylesheet href="${rssOptions.stylesheet}" type="text/xsl"?>`;
    }
    xml += `<rss version="2.0"`;
    // xmlns
    if (rssOptions.xmlns) {
        for (const [k, v] of Object.entries(rssOptions.xmlns)) {
            xml += ` xmlns:${k}="${v}"`;
        }
    }
    xml += `>`;
    xml += `<channel>`;
    // title, description, customData
    xml += `<title><![CDATA[${rssOptions.title}]]></title>`;
    xml += `<description><![CDATA[${rssOptions.description}]]></description>`;
    xml += `<link>${createCanonicalURL(site).href}</link>`;
    if (typeof rssOptions.customData === "string")
        xml += rssOptions.customData;
    // items
    for (const result of items || []) {
        // Begin fork
        if (result.isDraft) {
            continue;
        }
        // End fork
        validate(result);
        xml += `<item>`;
        xml += `<title><![CDATA[${result.title}]]></title>`;
        // If the item's link is already a valid URL, don't mess with it.
        const itemLink = isValidURL(result.link)
            ? result.link
            : createCanonicalURL(result.link, site).href;
        xml += `<link>${itemLink}</link>`;
        xml += `<guid>${itemLink}</guid>`;
        if (result.description)
            xml += `<description><![CDATA[${result.description}]]></description>`;
        // Begin fork
        if (rssOptions.contentLength === "full" && result.content) {
            xml += `<content:encoded><![CDATA[${result.content}]]></content:encoded>`;
        }
        // End fork
        if (result.pubDate) {
            // note: this should be a Date, but if user provided a string or number, we can work with that, too.
            if (typeof result.pubDate === "number" ||
                typeof result.pubDate === "string") {
                result.pubDate = new Date(result.pubDate);
            }
            else if (result.pubDate instanceof Date === false) {
                throw new Error("[${filename}] rss.item().pubDate must be a Date");
            }
            xml += `<pubDate>${result.pubDate.toUTCString()}</pubDate>`;
        }
        if (typeof result.customData === "string")
            xml += result.customData;
        xml += `</item>`;
    }
    xml += `</channel></rss>`;
    // validate user’s inputs to see if it’s valid XML
    const isValid = XMLValidator.validate(xml);
    if (isValid !== true) {
        // If valid XML, isValid will be `true`. Otherwise, this will be an error object. Throw.
        throw new Error(isValid);
    }
    return xml;
}
const requiredFields = Object.freeze(["link", "title"]);
// Perform validation to make sure all required fields are passed.
function validate(item) {
    for (const field of requiredFields) {
        if (!(field in item)) {
            throw new Error(`@astrojs/rss: Required field [${field}] is missing. RSS cannot be generated without it.`);
        }
    }
}
