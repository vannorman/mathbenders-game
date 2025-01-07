class StartupPhase {
    get name() {
        return this.constructor.name;
    }

    async execute() {
        console.log('Executing phase:', this.name);
    }
}

export default StartupPhase;