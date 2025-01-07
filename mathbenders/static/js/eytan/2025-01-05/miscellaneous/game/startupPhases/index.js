import LoadScripts from "./loadScripts";
import TemplatizePrefabs from "./templatizePrefabs";
import LoadEngine from "./loadEngine";

const gameStartupPhases = [
    new LoadEngine(),
    new LoadScripts(),
    new TemplatizePrefabs()
];

export default gameStartupPhases;