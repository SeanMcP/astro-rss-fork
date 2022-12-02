# astro-rss-fork 📖

---

**THIS IS A FORK OF THE ORIGINAL PACKAGE**

This is a (hopefully) temporary fork of the official `@astrojs/rss` package. It adds the following behavior:

## Support `content:encoded` in RSS feed

By passing the following configuration to the exposed `rss` function, you can add full content to your RSS feed for `.md` files:

```ts
export const get = () => rss({
  // Other options...
  contentLength: "full",
  xmlns: {
    content: "http://purl.org/rss/1.0/modules/content/",
  },
})
```

This feature does not support `.mdx` files, because it depends on `compiledContent` internally.

## Omit drafts from RSS feed

A bug in the official package includes items marked as `draft: true` in the RSS feed. This fork fixes that by omitting them in all cases.

---

This package brings fast RSS feed generation to blogs and other content sites built with [Astro](https://astro.build/). For more information about RSS feeds in general, see [aboutfeeds.com](https://aboutfeeds.com/).

## Installation

Install the `astro-rss-fork` package into any Astro project using your preferred package manager:

```bash
# npm
npm i astro-rss-fork
# yarn
yarn add astro-rss-fork
# pnpm
pnpm i astro-rss-fork
```

## Example usage

The `astro-rss-fork` package provides helpers for generating RSS feeds within [Astro endpoints][astro-endpoints]. This unlocks both static builds _and_ on-demand generation when using an [SSR adapter](https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project).

For instance, say you need to generate an RSS feed for all posts under `src/pages/blog/`. Start by [adding a `site` to your project's `astro.config` for link generation](https://docs.astro.build/en/reference/configuration-reference/#site). Then, create an `rss.xml.js` file under your project's `src/pages/` directory, and use [Vite's `import.meta.glob` helper](https://vitejs.dev/guide/features.html#glob-import) like so:

```js
// src/pages/rss.xml.js
import rss from 'astro-rss-fork';

export const get = () => rss({
    title: 'Buzz’s Blog',
    description: 'A humble Astronaut’s guide to the stars',
    // pull in the "site" from your project's astro.config
    site: import.meta.env.SITE,
    items: import.meta.glob('./blog/**/*.md'),
  });
```

Read **[Astro's RSS docs][astro-rss]** for full usage examples.

## `rss()` configuration options

The `rss` default export offers a number of configuration options. Here's a quick reference:

```js
rss({
  // `<title>` field in output xml
  title: 'Buzz’s Blog',
  // `<description>` field in output xml
  description: 'A humble Astronaut’s guide to the stars',
  // provide a base URL for RSS <item> links
  site: import.meta.env.SITE,
  // list of `<item>`s in output xml
  items: import.meta.glob('./**/*.md'),
  // (optional) absolute path to XSL stylesheet in your project
  stylesheet: '/rss-styles.xsl',
  // (optional) inject custom xml
  customData: '<language>en-us</language>',
  // (optional) add arbitrary metadata to opening <rss> tag
  xmlns: { h: 'http://www.w3.org/TR/html4/' },
});
```

### title

Type: `string (required)`

The `<title>` attribute of your RSS feed's output xml.

### description

Type: `string (required)`

The `<description>` attribute of your RSS feed's output xml.

### site

Type: `string (required)`

The base URL to use when generating RSS item links. We recommend using `import.meta.env.SITE` to pull in the "site" from your project's astro.config. Still, feel free to use a custom base URL if necessary.

### items

Type: `RSSFeedItem[] | GlobResult (required)`

Either a list of formatted RSS feed items or the result of [Vite's `import.meta.glob` helper](https://vitejs.dev/guide/features.html#glob-import). See [Astro's RSS items documentation](https://docs.astro.build/en/guides/rss/#generating-items) for usage examples to choose the best option for you.

When providing a formatted RSS item list, see the `RSSFeedItem` type reference below:

```ts
type RSSFeedItem = {
	/** Link to item */
	link: string;
	/** Title of item */
	title: string;
	/** Publication date of item */
	pubDate: Date;
	/** Item description */
	description?: string;
	/** Append some other XML-valid data to this item */
	customData?: string;
};
```

### stylesheet

Type: `string (optional)`

An absolute path to an XSL stylesheet in your project. If you don’t have an RSS stylesheet in mind, we recommend the [Pretty Feed v3 default stylesheet](https://github.com/genmon/aboutfeeds/blob/main/tools/pretty-feed-v3.xsl), which you can download from GitHub and save into your project's `public/` directory.

### customData

Type: `string (optional)`

A string of valid XML to be injected between your feed's `<description>` and `<item>` tags. This is commonly used to set a language for your feed:

```js
import rss from 'astro-rss-fork';

export const get = () => rss({
    ...
    customData: '<language>en-us</language>',
  });
```

### xmlns

Type: `Record<string, string> (optional)`

An object mapping a set of `xmlns` suffixes to strings of metadata on the opening `<rss>` tag.

For example, this object:

```js
rss({
  ...
  xmlns: { h: 'http://www.w3.org/TR/html4/' },
})
```

Will inject the following XML:

```xml
<rss xmlns:h="http://www.w3.org/TR/html4/"...
```

---

For more on building with Astro, [visit the Astro docs][astro-rss].

[astro-rss]: https://docs.astro.build/en/guides/rss/#using-astrojsrss-recommended
[astro-endpoints]: https://docs.astro.build/en/core-concepts/astro-pages/#non-html-pages
