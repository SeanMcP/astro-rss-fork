type GlobResult = Record<string, () => Promise<{
    [key: string]: any;
}>>;
type RSSOptions = {
    /** (required) Title of the RSS Feed */
    title: string;
    /** (required) Description of the RSS Feed */
    description: string;
    /**
     * Specify the base URL to use for RSS feed links.
     * We recommend "import.meta.env.SITE" to pull in the "site"
     * from your project's astro.config.
     */
    site: string;
    /**
     * List of RSS feed items to render. Accepts either:
     * a) list of RSSFeedItems
     * b) import.meta.glob result. You can only glob ".md" files within src/pages/ when using this method!
     */
    items: RSSFeedItem[] | GlobResult;
    /** Specify arbitrary metadata on opening <xml> tag */
    xmlns?: Record<string, string>;
    /**
     * Specifies a local custom XSL stylesheet. Ex. '/public/custom-feed.xsl'
     */
    stylesheet?: string | boolean;
    /** Specify custom data in opening of file */
    customData?: string;
    contentLength?: "summary" | "full";
};
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
    /** Item content */
    content?: string;
    /** Item is draft in frontmatter */
    isDraft: boolean;
};
type GenerateRSSArgs = {
    rssOptions: RSSOptions;
    items: RSSFeedItem[] | null;
};
export default function getRSS(rssOptions: RSSOptions): Promise<{
    body: string;
}>;
/** Generate RSS 2.0 feed */
export declare function generateRSS({ rssOptions, items, }: GenerateRSSArgs): Promise<string>;
export {};
