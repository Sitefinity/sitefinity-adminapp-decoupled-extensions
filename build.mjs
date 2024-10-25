import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rteManifestFileName = 'manifest.json';
const entryFile = path.resolve(__dirname, './src/rte/index.ts');
const outDir = path.resolve(__dirname, './dist/sfextensions/rte');
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');
const port = 4201;

function generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 20);
}

const hashAndManifestPlugin = {
    name: 'hash-and-manifest',
    setup(build) {
        build.onEnd(async (result) => {
            if (result.errors.length > 0) {
                console.error('Build failed with errors.');
                return;
            }

            const manifest = {};

            await fs.mkdir(outDir, { recursive: true });

            for (const file of result.outputFiles) {
                const content = file.contents;
                const hash = generateHash(content);
                const ext = path.extname(file.path);
                const baseName = path.basename(file.path, ext);
                const newFileName = `${baseName}.${hash}${ext}`;
                const newFilePath = path.join(outDir, newFileName);

                await fs.writeFile(newFilePath, content);
                console.log(`Written file: ${newFileName}`);

                manifest[baseName] = newFileName;
            }

            const manifestPath = path.join(outDir, rteManifestFileName);
            await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 4));
            console.log(`Manifest generated at: ${rteManifestFileName}`);
        });
    },
};

// Function to clean the output directory
async function cleanOutDir() {
    try {
        await fs.rm(outDir, { recursive: true, force: true });
        await fs.mkdir(outDir, { recursive: true });
        console.log(`Cleaned output directory: ${outDir}`);
    } catch (error) {
        console.error(`Error cleaning output directory: ${error}`);
        process.exit(1);
    }
}

async function buildProject() {
    try {
        await esbuild.build({
            entryPoints: [entryFile],
            bundle: true,
            format: 'iife',
            minify: true,
            keepNames: false,
            splitting: false,
            tsconfig: tsconfigPath,
            outdir: outDir,
            legalComments: 'none',
            write: false,
            plugins: [hashAndManifestPlugin],
            metafile: true,

        });
        console.log('Build completed successfully.');
    } catch (error) {
        console.error(`Build failed: ${error}`);
        process.exit(1);
    }
}

async function watchProject() {
    try {
        let ctx = await esbuild.context({
            entryPoints: [entryFile],
            bundle: true,
            format: 'iife',
            minify: true,
            keepNames: false,
            splitting: false,
            tsconfig: tsconfigPath,
            outdir: outDir,
            legalComments: 'none',
            write: false,
            plugins: [hashAndManifestPlugin],
            metafile: true,
        });
        ctx.watch();
        console.log('Watch completed successfully.');
    } catch (error) {
        console.error(`Watch failed: ${error}`);
        process.exit(1);
    }
}

async function startServer() {
    await buildProject();

    const context = await esbuild.context({
        entryPoints: [entryFile],
        bundle: true,
        format: 'iife',
        minify: true,
        keepNames: false,
        splitting: false,
        tsconfig: tsconfigPath,
        outdir: outDir,
        legalComments: 'none',
        write: false,
        plugins: [hashAndManifestPlugin],
        metafile: true,
    });

    // Start watching for changes
    await context.watch();

    // Initialize Express app
    const app = express();

    app.use(cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ["*"],
    }));

    app.use("/sfextensions/rte", express.static(outDir));

    app.options('*', cors());

    app.listen(port, () => {
        console.log(`Express server is running at http://localhost:${port}`);
    });

    console.log('Watching for changes...');
}

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0];

    if (mode === 'build') {
        await cleanOutDir();
        await buildProject();
    } else if (mode === 'start') {
        await cleanOutDir();
        await startServer();
    } else if (mode === 'watch') {
        await cleanOutDir();
        await watchProject();
    }
    else {
        console.error('Invalid mode. Use "build", "watch" or "start".');
        process.exit(1);
    }
}

main();
