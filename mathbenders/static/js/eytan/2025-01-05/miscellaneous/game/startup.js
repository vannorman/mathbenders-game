import startupPhases from "./startupPhases";

async function executeWithTimeout(phase) {
    const phaseExecution = phase.execute();
    const timeoutDurationInSeconds = 5;
    const timeoutDurationInMilliseconds = timeoutDurationInSeconds * 1000;
    const timeoutPromise = new Promise((_, reject) => {
        return setTimeout(() => reject(new Error(`Phase "${phase.name}" timed out after ${timeoutDurationInMilliseconds}ms`)), timeoutDurationInMilliseconds);
        }
    );
    return Promise.race([phaseExecution, timeoutPromise]);
}

export async function ExecuteStartupPhases() {
    const maxRetries = 3;
    const retryDelayInSeconds = 3;
    const retryDelayInMilliseconds = retryDelayInSeconds * 1000;
    let shouldResumeExecution = true;
    for (const startupPhase of startupPhases) {
        if (!shouldResumeExecution) {
            console.log('Aborting remaining phases due to previous error.');
            break;
        }
        let remainingRetries = maxRetries;
        let successfullyExecutedCurrentPhase = false;
        while (remainingRetries > 0 && !successfullyExecutedCurrentPhase) {
            try {
                console.log(`Starting phase "${startupPhase.name}" (Attempt ${remainingRetries})`);
                await executeWithTimeout(startupPhase);
                successfullyExecutedCurrentPhase = true;
            } catch (error) {
                remainingRetries--;
                console.error(`Error during phase "${startupPhase.name}": ${error.message}`);
                if (remainingRetries === 0) {
                    console.error(`Phase "${startupPhase.name}" failed after ${maxRetries} attempts. Aborting.`);
                    shouldResumeExecution = false;
                    break;
                }
                if (error.message.includes('timed out')) {
                    console.log(`Phase "${startupPhase.name}" timed out. Retrying in ${retryDelayInSeconds} seconds...`);
                } else {
                    console.log(`Retrying phase "${startupPhase.name}" in ${retryDelayInSeconds} seconds...`);
                }
                await new Promise(resolve => setTimeout(resolve, retryDelayInMilliseconds));
            }
        }
    }
}

/* Example console output method above:
    Starting phase "InitializeAssets" (Attempt 1)
    Executing phase InitializeAssets
    Loading assets...
    Assets loaded.
    Starting phase "SetupEnvironment" (Attempt 1)
    Executing phase SetupEnvironment
    Setting up environment...
    Error during phase "SetupEnvironment": Failed to set up environment
    Retrying phase "SetupEnvironment" in 1 seconds...
    Starting phase "SetupEnvironment" (Attempt 2)
    Executing phase SetupEnvironment
    Setting up environment...
    Error during phase "SetupEnvironment": Failed to set up environment
    Retrying phase "SetupEnvironment" in 1 seconds...
    Starting phase "SetupEnvironment" (Attempt 3)
    Executing phase SetupEnvironment
    Setting up environment...
    Error during phase "SetupEnvironment": Failed to set up environment
    Phase "SetupEnvironment" failed after 3 attempts. Aborting.
    Aborting remaining phases due to previous error.
*/