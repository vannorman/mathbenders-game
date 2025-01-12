// Based on what I saw in loginWeb, I noted that there are the following major behaviours:
// 1. Realm API calls
// 2. Auth related logic, involving cookies & tokens
// 3. DOM manipulation
// Below is a sketch of a way to think of these behaviors encapsulated by separate classes.

/**
 * - Service for saving/loading realms via REST API.
 * - May be used by the loginWeb and RealmBuilder, both
 *   of which want to perform some save/load operations on realms
 */
class RealmService {

    constructor() {
        this.list = this.list.bind(this);
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
    }

    // renamed from GetLevels
    // TODO: should be async
    list(userId, callback) {
        if (!userId) throw new Error('Invalid userId');

        const realms = [];
        fetch(`/user/${userId}/realms`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                data.realms?.forEach(realm => {
                    realms.push(realm);
                    $('#realms').append(`<li>Realm: ${realm.name}</li>`);
                });
                if (callback && typeof(callback) === 'function') callback();
            })
    }

    // TODO: should be async
    load(options = {}) {
        if (options === {}) return;

        // TODO: this should probably be a GET request
        // using a url like '/user/realms/load/${id}'
        // or '/user/${userId}/realms?realmId=${realmId}
        const url = '/user/realms/load';
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { data: { realm_id: options.id } }
        }).then(response => {
            if (!response.ok) throw new Error(`Request to load realm failed with error: ${response.status}`)

            return response.json();
        }).then(result => options.callback?.(result));
    }

    // TODO: should be async
    save(options = {}) {
        if (options === {}) return;

        fetch('/user/realms/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { data: { /* fields to post */ } }
        }).then(response => {
            if (!response.ok) {
                options.onFail?.();
                throw new Error(`Request to load realm failed with error: ${response.status}`)
            }
            options.onSuccess?.();
            return response.json();
        }).catch(error => {
            options.onFail?.();
            console.error('Error sending data:', error);
        });
    }

}

// Authentication service to handle API calls associated with auth.
// It also may make sense to handle auth/user related cookies in here as well
class AuthenticationService {

    constructor(cookieHandler) {
        this.cookieHandler = cookieHandler;
    }

    constructor() {
        this.cookieHandler = new CookieHandler();
    }

    // Need a replacement for CheckForAccessToken. Too much is going on in there.
    // There is an API call, and then there's potentially DOM manipuation.
    // This should probably just return the result of an API call and then some other
    // class which uses this class will use the result to manipulate the DOM.
    login() {}

    // We also need to replace CheckForCode for the same reason

    logout() {
        this.cookieHandler.clear();
        window.location.reload();
    }

    get isLoggedIn() {
        return this.cookieHandler.get('username');
    }

}

/**
 * - CookieHandler handles cookie actions.
 * - We may want to consider using a Map as the underlying data structure,
 *   but maybe that's overkill
 * - To be used by LoginWeb or by AuthenticationService.
 * - It may make sense to just have this as part of the AuthenticationService example,
 *   as having a cookie services may be too granular/specific
 */
class CookieHandler {

    constructor() {
        this.set = this.set.bind(this);
        this.get = this.get.bind(this);
        this.remove = this.remove.bind(this);
        this.clear = this.clear.bind(this);
    }

    set(key, value) {
        if (!key || !value) throw new Error('Invalid cookie key-pair');

        const currentDate = new Date();
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const daysUntilExpiration = 14;
        const expirationDate = new Date(currentDate.getTime() + daysUntilExpiration * millisecondsPerDay);
        document.cookie = `${key}=${value}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
    }

    get(cookie) {
        if (!cookie) throw new Error('Attempting to get an invalid cookie');

        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${cookie}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    remove(cookie) {
        if (!cookie) throw new Error('Attempting to get an invalid cookie');

        document.cookie = cookie + '=; Max-Age=-99999999;';
    }

    clear() {
        const cookies = document.cookie.split("; ");
        for (let i = 0; i < cookies.length; i++) {
            const cookieName = cookies[i].split("=")[0];
            this.remove(cookieName);
        }
    }

}

/**
 * LoginWeb with the methods of the original implementation associated with modifying DOM elements.
 * LoginWeb could have a reference to the services
 */
class WebLoginHandler {

    constructor(options) {
        this.realmService = new RealmService();
        this.authenticationService = new AuthenticationService();
        this.cookieHandler = new CookieHandler();
    }

    showUser() {
    }

    showLogin() {
    }

    hideAll() {
    }

}