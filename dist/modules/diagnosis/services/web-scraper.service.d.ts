export interface WebPageData {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    h1: string[];
    h2: string[];
    links: {
        href: string;
        text: string;
        isExternal: boolean;
    }[];
    images: {
        src: string;
        alt: string;
        isLazy: boolean;
    }[];
    scripts: {
        src: string;
        isAsync: boolean;
        isDeferred: boolean;
    }[];
    styles: {
        href: string;
        media: string;
    }[];
    metaTags: Record<string, string>;
    openGraph: Record<string, string>;
    twitter: Record<string, string>;
    canonical: string;
    robots: string;
    schemaOrg: Record<string, any>[];
    viewport: string;
    charset: string;
    lang: string;
    bodyText: string;
    wordCount: number;
    linksCount: {
        internal: number;
        external: number;
    };
    imagesWithAlt: number;
    imagesWithoutAlt: number;
}
export interface WebScrapeResult {
    success: boolean;
    data?: WebPageData;
    error?: string;
    score: {
        technical: number;
        content: number;
        accessibility: number;
        performance: number;
    };
}
export declare class WebScraperService {
    private readonly logger;
    private httpClient;
    constructor();
    scrapeWebsite(url: string): Promise<WebScrapeResult>;
    scrapeMultiple(urls: string[]): Promise<WebScrapeResult[]>;
    private normalizeUrl;
    private extractPageData;
    private parseKeywords;
    private calculateBasicScore;
    private delay;
}
