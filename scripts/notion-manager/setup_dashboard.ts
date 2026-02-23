
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const PAGE_ID = "2feac774-8cdb-8004-98f6-efc048b2af52";

async function setupSimpleDashboard() {
    console.log("Setting up dashboard...");

    try {
        // 1. Rename the main page
        await notion.pages.update({
            page_id: PAGE_ID,
            icon: {
                type: "emoji",
                emoji: "🚀"
            },
            properties: {
                title: [
                    {
                        text: {
                            content: "Cal-Speak-Buddy Dashboard",
                        },
                    },
                ],
            },
        });
        console.log("✅ Renamed page to 'Cal-Speak-Buddy Dashboard'");

        // 2. Create Tasks Database
        // Note: Creating a database requires a parent page.
        const tasksDb = await notion.databases.create({
            parent: {
                page_id: PAGE_ID,
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: "Tasks",
                    },
                },
            ],
            properties: {
                Name: {
                    title: {},
                },
                Status: {
                    select: {
                        options: [
                            { name: "To Do", color: "red" },
                            { name: "In Progress", color: "blue" },
                            { name: "Done", color: "green" },
                        ],
                    },
                },
                Priority: {
                    select: {
                        options: [
                            { name: "High", color: "red" },
                            { name: "Medium", color: "yellow" },
                            { name: "Low", color: "gray" },
                        ],
                    },
                },
                "Due Date": {
                    date: {},
                },
            },
        });
        console.log(`✅ Created 'Tasks' database (ID: ${tasksDb.id})`);

        // 3. Create Notes Database
        const notesDb = await notion.databases.create({
            parent: {
                page_id: PAGE_ID,
            },
            title: [
                {
                    type: "text",
                    text: {
                        content: "Notes",
                    },
                },
            ],
            properties: {
                Name: {
                    title: {},
                },
                Type: {
                    select: {
                        options: [
                            { name: "Meeting", color: "purple" },
                            { name: "Brainstorming", color: "orange" },
                            { name: "Reference", color: "gray" },
                        ],
                    },
                },
                Date: {
                    date: {}
                }
            },
        });
        console.log(`✅ Created 'Notes' database (ID: ${notesDb.id})`);

        console.log("\n🎉 Dashboard setup complete!");
        console.log(`View it here: ${tasksDb.url.replace(tasksDb.id.replace(/-/g, ''), '')}`); // Approximate URL logic or just rely on user finding it.

    } catch (error) {
        console.error("Error setting up dashboard:", error);
    }
}

setupSimpleDashboard();
