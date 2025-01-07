import { ExecuteStartupPhases } from "./startup";

const Game = () => {
    const startUp = async () => await ExecuteStartupPhases();

    return { startUp };
};

export default Game;