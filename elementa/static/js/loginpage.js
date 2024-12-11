// IMPORTANT! Crossed methods and scripts between PLAYCANVAS base and HTML base .. need to differentiate these
// As of today (Sun Nov 24 2024), global methods exist polluting both spaces (the game logic and the web front end logic)
function HideAll(){
    $('#login').hide();
    $('#user').hide();
}
function ShowLogin(){
    $('#login').show();
}
function ShowUser(){
    $('#user').show();
    const user_id = localStorage.getItem("user_id");
    const user_name = localStorage.getItem("user_name");
    $('#userName').text(user_name);
    $('#userId').text(user_id);
    GetLevels(user_id);
}

function GetLevels(callback){
    user_id = getCookie('user_id');
    levels = [];

    if (user_id){
        console.log("get user:"+user_id);
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
            // console.log('data'+JSON.stringify(data));
            data.levels.forEach(level=>{
                levels.push(level);
                console.log("levels pushed");
                $('#levels').append("<li>Level:"+level.name);
            });
            // Redirect or take other actions if needed
            console.log('levels:'+levels);
            if (typeof(callback)==='function')callback(levels);
          })
          .catch((error) => console.error('Error:', error));
    } else {
        console.log("Not logged in? No userid.");
    }
}


function CheckForAccessToken(){
    // Get the hash part of the URL
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // Remove the '#' and parse
    const accessToken = params.get('access_token'); // Get the value of 'auth_token'
    
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
            console.log('data'+JSON.stringify(data));
            if (data.loggedIn){
                SetLoginCookies(data.userId,data.userName);
                ShowUser();
            } else {
                ShowLogin();
            }
            // Redirect or take other actions if needed
          })
          .catch((error) => console.error('Error:', error));
    } else {
        ShowLogin();
    }
}

function CheckForCode(){
    const code = new URL(location.href).searchParams.get('code')
    if (code){
        // User just logged in. (local)
        // Supabase redirects user to this page with #access_token=SOMETOKEN, which we can then use to get the userid.
        console.log("code:"+code);
        fetch('/auth/code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: code}),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('data'+JSON.stringify(data));
            if (data.loggedIn){
                SetLoginCookies(data.userId,data.userName);
                ShowUser();
            } else {
                console.log('invalid code (local?) found');
               ShowLogin();
            }
            // Redirect or take other actions if needed
          })
          .catch((error) => console.error('Error:', error));
    }else{
       ShowLogin();

    }
    
}
    
const isLoggedIn = () => { return getCookie('username') }

$(document).ready(function(){
    HideAll();
    if (isLoggedIn()){
        console.log('is');
        ShowUser();
    } else if (window.location.href.includes('127') || window.location.href.includes('localhost')){
        console.log("checkcode");
        CheckForCode();
    } else {
        console.log("checktokn");
        CheckForAccessToken();
    }

    $('#logout').click(function(){
        clearAllCookies();
        window.location.reload();
    });

    $('#initDb').click(function(){
        InitDb();
    });
});

function InitDb(){
    fetch('/initdb',{ 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
//          body: JSON.stringify({ }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('init db:'+JSON.stringify(data));
            // Redirect or take other actions if needed
          })
          .catch((error) => console.error('Error:', error));
      }

function SetLoginCookies(userId, username) {
    // Set cookies with an expiration of 7 days
    const expires = new Date();
    const day_ms = 1000 * 60 * 60 * 24;
    expires.setDate(expires.getTime() + 14 * day_ms); 

    document.cookie = `user_id=${userId}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    document.cookie = `username=${username}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function getUserData() {
    const userId = getCookie('user_id');
    const username = getCookie('username');
    
    if (userId && username) {
        return { userId:userId, userName:username };
    }
    return null;
}

function clearAllCookies() {
    console.log("cleared!");
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
        const cookieName = cookies[i].split("=")[0];
        eraseCookie(cookieName);
    }
}

function eraseCookie(name) {
    document.cookie = name+'=; Max-Age=-99999999;';
}
