import StartupPhase from "./startupPhase";

// Should be configured somehow in a separate file
const scripts = [
    { type: 'Plain', path: '/static/js/followPlayer.js' },
    { type: 'PlayCanvas', path: '/static/js/entities/door.entity.js' },
    { type: 'Module', path: '/static/js/modules/door.module.js' },
];

class LoadScripts extends StartupPhase {
    get name() { return 'Loading Scripts'; }

    async execute() {
        console.log('Loading scripts...');
        await loadScripts(scripts);
        console.log('Finished loading scripts.');
    }
}

export default LoadScripts;

async function loadScripts(scripts) {
    const loaders = {'Plain': loadPlainScript, 'Module': loadModuleScript, 'PlayCanvas': loadPlayCanvasScript };
    for (const script of scripts) {
        const load = loaders[script.type];
        await load(script);
    }
}

async function loadPlainScript(script) {
    await super.handle(script);
    const scriptElement = document.createElement('script');
    scriptElement.src = script.path;
    document.head.appendChild(scriptElement);
}

async function loadModuleScript(script) {
    await super.handle(script);
    const scriptElement = document.createElement('script');
    scriptElement.src = script.path;
    scriptElement.type = 'module';
    document.head.appendChild(scriptElement);
}

async function loadPlayCanvasScript(script) {
    await pc.app.assets.loadFromUrl(script.path, 'script');
}
