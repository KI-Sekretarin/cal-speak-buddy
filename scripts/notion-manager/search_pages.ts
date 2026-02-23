
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function listPages() {
    try {
        const response = await notion.search({
            filter: {
                value: 'page',
                property: 'object'
            },
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time'
            }
        });

        console.log("Found " + response.results.length + " pages.");
        response.results.forEach((page: any) => {
            const title = page.properties?.title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                "Untitled";
            console.log(`- [${title}] (ID: ${page.id})`);
        });
    } catch (error) {
        console.error(error);
    }
}

listPages();
