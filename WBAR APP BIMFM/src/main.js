import {App} from './app.js';

const canvas = document.getElementById('canvas');

async function main() {
    const app = new App(canvas);
    await app.initialize();
    app.start();
}

main();
