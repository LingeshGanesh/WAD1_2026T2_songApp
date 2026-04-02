const path = require("path");
const { spawn } = require("child_process");

const seedScripts = [
    "seed-users.js",
    "seed-users2.js",
    "seed-songs.js",
    "seed-albums.js",
    "seed-events.js",
    "seed-reviews.js",
    "generate-playlists.js"
];

function runSeedScript(scriptName) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, scriptName);
        const child = spawn(process.execPath, [scriptPath], {
            stdio: "inherit"
        });

        child.on("error", reject);
        child.on("exit", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`${scriptName} exited with code ${code}`));
        });
    });
}

async function run() {
    try {
        for (const scriptName of seedScripts) {
            console.log(`\nRunning ${scriptName}...`);
            await runSeedScript(scriptName);
        }

        console.log("\nAll seed scripts completed successfully.");
    } catch (error) {
        console.error("\nSeed runner failed:", error.message);
        process.exitCode = 1;
    }
}

run();
