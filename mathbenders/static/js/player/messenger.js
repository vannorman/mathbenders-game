class PlayerMessenger {
    static build() { 
        // Create the text entity
        PlayerMessenger.textEntity = new pc.Entity();
        PlayerMessenger.textEntity.addComponent("element", {
            type: "text",
            anchor: [0.5, 0.5, 0.5, 0.5], // Centered
            pivot: [0.5, 0.5],
            fontAsset: assets.fonts.montserrat,
            fontSize: 32,
            color: new pc.Color(1, 1, 1), // White text
            text: "" // Start hidden
        });

        // Add the text entity to the UI layer
        Player.screen.addChild(PlayerMessenger.textEntity);

        // State management
        PlayerMessenger.state = "ready"; // Can be "typing", "fading out", "ready"
        PlayerMessenger.currentText = "";
        PlayerMessenger.typingIndex = 0;
        PlayerMessenger.fadeTimer = 0;
        
        GameManager.subscribe(PlayerMessenger,PlayerMessenger.onGameStateChange);

    }

    static onGameStateChange(state){
        switch(state){
        case GameState.RealmBuilder:
            //console.log("Playerturning off for levelbuilder mode.");
            PlayerMessenger.textEntity.enabled = false;
            break;
        case GameState.Playing:
//            console.log("Player turning on for playing mode.");
            PlayerMessenger.textEntity.enabled = true;
            break;
        }


    }

    static async Say(text) {
        // If a new message is called, reset everything
        PlayerMessenger.state = "typing";
        PlayerMessenger.currentText = text;
        PlayerMessenger.typingIndex = 0;
        PlayerMessenger.textEntity.element.text = "";

        // Typing effect
        while (PlayerMessenger.typingIndex < text.length && PlayerMessenger.state === "typing") {
            PlayerMessenger.textEntity.element.text += text[PlayerMessenger.typingIndex];
            PlayerMessenger.typingIndex++;
            await PlayerMessenger.sleep(10 + Math.random() * 20); // 0.1 - 0.2s delay
        }

        // If interrupted, exit early
        if (PlayerMessenger.state !== "typing") return;

        // Wait before fading out
        PlayerMessenger.state = "fading out";
        PlayerMessenger.fadeTimer = 2; // Display message for 2 seconds

        while (PlayerMessenger.fadeTimer > 0 && PlayerMessenger.state === "fading out") {
            PlayerMessenger.fadeTimer -= 0.1;
            await PlayerMessenger.sleep(100);
        }

        // If interrupted, exit early
        if (PlayerMessenger.state !== "fading out") return;

        // Fade out animation
        let opacity = 1;
        while (opacity > 0 && PlayerMessenger.state === "fading out") {
            opacity -= 0.05;
            PlayerMessenger.textEntity.element.opacity = opacity;
            await PlayerMessenger.sleep(50);
        }

        // Reset
        PlayerMessenger.textEntity.element.text = "";
        PlayerMessenger.textEntity.element.opacity = 1;
        PlayerMessenger.state = "ready";
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

