// Assuming you have initialized Auth0
let auth0Client;

// Function to initialize Auth0
async function initializeAuth0() {
    auth0Client = await createAuth0Client({
        domain: "dev-jzpaf0k2ay3yfua7.us.auth0.com",
        client_id: "HpHJneAf7iCCGI9gyAhCiR8iz8Cfnmdx"
    });
    updateLoginStatus();
}

// Function to update login status display
async function updateLoginStatus() {
    const isAuthenticated = await auth0Client.isAuthenticated();
    console.log('up..'); 
    if (isAuthenticated) {
        const user = await auth0Client.getUser();
        $("#loginStatus").text("Login status: Logged in as ${user.name}");
    } else {
        $("#loginStatus").text("Login status: Not logged in");
    }
}

// Call initializeAuth0 to set up authentication and update the login status on page load
initializeAuth0();

// Optionally, call updateLoginStatus periodically to keep the status up-to-date
setInterval(updateLoginStatus, 5000);
