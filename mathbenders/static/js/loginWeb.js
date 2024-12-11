// IMPORTANT! Crossed methods and scripts between PLAYCANVAS base and HTML base .. need to differentiate these
// As of today (Sun Nov 24 2024), global methods exist polluting both spaces (the game logic and the web front end logic)
class LoginWeb {
    constructor(opts){
        const {
            loginDiv,
            userDiv,
            userNameDiv,
            userIdDiv,
            logoutDiv
        } = opts;
        this.loginDiv = loginDiv;
        this.userDiv = userDiv;
        this.userNameDiv = userNameDiv;
        this.userIdDiv = userIdDiv;
        this.logoutDiv = logoutDiv;
    } 

     logout(){
        this.clearAllCookies();
        window.location.reload();
    }

    get isLoggedIn() {
        return this.getCookie('username');
    }

     HideAll(){
        this.loginDiv.hide();
        this.userDiv.hide();
    }
     ShowLogin(){
        this.loginDiv.show();
    }
     ShowUser(){
        this.userDiv.show();
        const user_id = this.getCookie('user_id')
        const user_name = this.getCookie('username');
        this.userNameDiv.text(user_name);
        

        this.userIdDiv.text(user_id);
        

        this.GetLevels(null);
    }

     GetLevels(callback){
        let user_id = this.getCookie('user_id');
        let realms = [];

        if (user_id){
            fetch('/user/get_realms', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId : user_id }),
            })
              .then((response) => response.json())
              .then((data) => {
                    console.log(data)
                    data.levels.forEach(realm=>{
                    realms.push(realm);
                    // $('#levels').append("<li>Level:"+realm.name);
                });
                // Redirect or take other actions if needed
                if (typeof(callback)==='function'){
                    callback(realms);
                }
              })
              //.catch((error) => console.error('Error:', error));
        } else {
            console.log("Not logged in? No userid.");
        }
    }


     CheckForAccessToken(){
        // Get the hash part of the URL
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1)); // Remove the '#' and parse
        const accessToken = params.get('access_token'); // Get the value of 'auth_token'
        const $this = this; 
        if (accessToken) {
            // User just logged in.
            // Supabase redirects user to this page with #access_token=SOMETOKEN, which we can then use to get the userid.
            // console.log("fr:"+accessToken.substr(0,20))
            fetch('/auth/access_token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken: accessToken }),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.loggedIn){
                    $this.SetLoginCookies(data.userId,data.userName);
                    $this.ShowUser();
                } else {
                    $this.ShowLogin();
                }
                // Redirect or take other actions if needed
              })
//              .catch((error) => console.error('Error:', error));
        } else {
            $this.ShowLogin();
        }
    }

     CheckForCode(){
        const code = new URL(location.href).searchParams.get('code')
        const $this = this;
        if (code){
            // User just logged in. (local)
            // Supabase redirects user to this page with #access_token=SOMETOKEN, which we can then use to get the userid.
            fetch('/auth/code', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code: code}),
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.loggedIn){
                    $this.SetLoginCookies(data.userId,data.userName);
                    $this.ShowUser();
                } else {
                    console.log('invalid code (local?) found');
                    $this.ShowLogin();
                }
                // Redirect or take other actions if needed
              })
              //.catch((error) => console.error('Error:', error));
        }else{
            $this.ShowLogin();

        }
        
    }
    
     SetLoginCookies(userId, username) {
        // Set cookies with an expiration of 7 days
        const expires = new Date();
        const day_ms = 1000 * 60 * 60 * 24;
        expires.setDate(expires.getTime() + 14 * day_ms); 

        document.cookie = `user_id=${userId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
        document.cookie = `username=${username}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }

     getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

     getUserData() {
        const userId = this.getCookie('user_id');
        const username = this.getCookie('username');
        
        if (userId && username) {
            return { userId:userId, userName:username };
        }
        return null;
    }

     clearAllCookies() {
        console.log("cleared cook!");
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const cookieName = cookies[i].split("=")[0];
            this.eraseCookie(cookieName);
        }
    }

     eraseCookie(name) {
        document.cookie = name+'=; Max-Age=-99999999;';
    }
    LoadRealmData(options){
        const {realmId,callback} = options;
        if (!loginWeb.isLoggedIn) {
            alert('not logged in!');
            return;
        }
        const dataToSend = {
            realm_id : realmId,
        }
        fetch('/user/load_realm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: dataToSend })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
                
        })
        .then(result =>{
            callback(result); // LoadRealm(
        })
        //.catch(error => { console.error("Error sending data:", error); });
    }

    SaveRealmData(options){
        const { realmData,id,name,callbackSuccess,callbackFail } = options;
        if (!loginWeb.isLoggedIn) {
            alert('not logged in!');
            callbackFail();
            return;
        }
        console.log("saving:"+name+" ... ");
        const dataToSend = {
            realm_id :id,
            name : name,
            realmData : realmData,
            creator_id : loginWeb.getCookie('user_id'),
            short_link : 'lev123',
            waypoints : [],
        }
        fetch('/user/save_realm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: dataToSend })

        })
        .then(response => {
            if (!response.ok) {
                callbackFail();
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            callbackSuccess();
            return response.json();
        })
        .catch(error => {
            callbackFail();
            console.error("Error sending data:", error);
        });

    }

}

var loginWeb;
$(document).ready(function(){
    loginWeb = new LoginWeb({
        loginDiv : $('#login'),
        userDiv : $('#user'),
        userNameDiv : $('#userName'),
        userIdDiv : $('#userId'),
        logoutDiv : $('#logout'),
    });

    
    loginWeb.HideAll();
    if (loginWeb.isLoggedIn){
        loginWeb.ShowUser();
    } else if (window.location.href.includes('127') || window.location.href.includes('localhost')){
        console.log("checkcode");
        loginWeb.CheckForCode();
    } else {
        console.log("checktokn");
        loginWeb.CheckForAccessToken();
    }

    $('#logoutDiv').click(function(){
        loginWeb.logout();
    });
});


