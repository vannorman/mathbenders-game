from datetime import datetime
import requests
from functools import wraps
# from settings_local import db, util
import json
from os import environ as env
import os
from urllib.parse import quote_plus, urlencode
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for, jsonify, request, after_this_request, send_file
from werkzeug.utils import secure_filename

# Get the base directory dynamically
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))

# Load the .env file from the derived base directory
env_path=os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)


# SUPABASE AUTH
from supabase import create_client, Client
SUPABASE_URL = env.get("SUPABASE_URL")
SUPABASE_API_KEY = env.get("SUPABASE_API_KEY")
SUPABASE_CALLBACK = env.get("SUPABASE_CALLBACK")
SUPABASE_GAME_CALLBACK = env.get("SUPABASE_GAME_CALLBACK")
supabase = create_client(SUPABASE_URL, SUPABASE_API_KEY)

try:
    from elementa import db # Server import
except ImportError:
    import db # Local import


    
app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")
app.config['PERMANENT_SESSION_LIFETIME'] = 60 * 24 * 7
app.config['SESSION_COOKIE_SECURE'] = True  # Ensures cookies are only sent over HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevents JavaScript access to cookies
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Reduces CSRF risk




#___________ SUPABASE AUTH METHODS _____________#

@app.route('/login')
def login():
    provider = request.args.get("provider")
    callback = request.args.get("callback")
    res = supabase.auth.sign_in_with_oauth(
        {
            "provider": provider,
            "options": {
                "redirect_to": f"{callback}"
	        },
        }
    )

    # print(str(res))
    return redirect(res.url)


#@app.route("/callback", methods=["GET", "POST"])
#def callback():
#    print("~~ CALLBACk")
#    token = oauth.auth0.authorize_access_token()
#    session["user"] = token
#    return redirect("/game")

@app.route('/logout')
def logout():
    # Use Supabase's sign_out() method
    session.clear()  # Clears all session data
    try:
        res = supabase.auth.sign_out()

        # Clear session data from Flask
        session.pop('access_token', None)
        session.pop('user', None)

        # Redirect to the homepage or login page
        return redirect(SUPABASE_CALLBACK)
    except Exception as e:
        return f"Logout failed: {e}", 500

@app.route("/mathbreakers")
def mathbreakers():
    return redirect("https://mathbreakers.com")


@app.route('/loginpage')
def loginpage():
    logged_in = session.get('logged_in', False)
    user_name = session.get('user_name', "Guest")
    user_id = session.get('user_id', None)
   
    callback = SUPABASE_CALLBACK
    return render_template('loginpage.html', **locals())


@app.route('/auth/access_token', methods=['GET','POST'])
def auth_access_token():
    
    data = request.json
    access_token = data.get('accessToken')  
    try:
        user_response = supabase.auth.get_user(access_token)
        user_id = user_response.user.id
        user_name = user_response.user.user_metadata['full_name'].split(' ')[0]
        logged_in = True
    except:
        user_name = "none"
        user_id = "none"
        logged_in = False

    return jsonify({
        "userName": user_name,
        "userId": user_id,
        "loggedIn" : logged_in
    })

@app.route('/auth/code', methods=['GET','POST'])
def auth_code():
    print("auth code:"+str(request.json))
    data = request.json
    code = data.get('code')  
    try:
        user_response = supabase.auth.exchange_code_for_session({"auth_code":code})
        user_id = user_response.user.id
        user_name = user_response.user.user_metadata['full_name'].split(' ')[0]
        logged_in = True
    except:
        user_name = "none"
        user_id = "none"
        logged_in = False

    return jsonify({
        "userName": user_name,
        "userId": user_id,
        "loggedIn" : logged_in
    })



def get_user_from_auth_session(request):
    access_token = request.args.get('access_token')
    print("access?")
    if access_token:
        print("Acces;"+access_token)
        try: 
            res = supabase.auth.get_user(access_token)
            print("RES:"+str(res))

            # Access the user object from the AuthResponse
            user = res.user

            if user:
                # Extract user metadata
                user_metadata = user.user_metadata
                if user_metadata:
                    # Extract the full name
                    full_name = user_metadata.get('full_name', '')
                    user_name = full_name.split(' ')[0] if full_name else "Guest"
                    user_id = user.id
                    print(f"user:{user}")
                else:
                    print("No user metadata available")
            else:
                print("No user information found in the response")
            logged_in = True
        except:
            user_name = "Bad code"
            user_id = "Try log in again"
            logged_in = False
        return user_name, user_id, logged_in
    else:
        print("args:"+str(request.args))
    return "None", "No id", False
 

#______________  DB METHODS  ________________#

# Initialize the database on app start
@app.route('/initdb', methods=['POST'])
def initialize_database():
    db.init_db()
    return jsonify({"status": "(skippd) Database deleted/initialized successfully."})

@app.route('/user/get_realms', methods=['GET','POST'])
def get_realms():
    data = request.json
    user_id = data.get('userId')  
    print("GETREALM:"+user_id)
    try:
        levels = db.get_realms(user_id)
        logged_in = True
    except Exception as e:
        levels = str(e)

    return jsonify({
        "levels": levels,
    })


@app.route('/user/save_realm', methods=['POST','GET'])
def save_realm():
    data = request.get_json().get('data')
    # print("data:"+str(data))
    result = db.save_realm(data)
    return jsonify(result)

# Load method to retrieve realm by ID
@app.route('/user/load_realm', methods=['POST','GET'])
def load_realm():
    data = request.get_json().get('data')
    print("data ~~~:"+str(data))
    realm_id = data['realm_id'] # .get('realmId')
    print("Re:"+realm_id)
#    short_link = request.args.get("short_link")
#    classroom_id = request.args.get("classroom_id")
#    user_id = request.args.get("user_id")

    result = db.get_realm_by_realm_id(realm_id)

    print("REs:"+str(result))
    return jsonify(result)

@app.teardown_appcontext
def close_connection(exception):
    if (db): db.close_connection(exception)



#@app.route('/get_perlin', methods=['POST'])
#def get_perlin():
#    data = request.get_json()
#    dim = data.get('dim')
#    print("DIM:"+str(dim)) 
#    _noise = util.generate_perlin_noise(dim,dim)
#    noise = json.dumps(_noise, cls=util.NumpyEncoder)
#    return jsonify({'success':True,'noise':noise}) 

@app.route("/", subdomain="dev")
def dev_home():
    return game()

@app.route("/game/")
def game_re():
    return game()

@app.route("/game")
def game():
    # supabase_key = env.get("SUPABASE_API_KEY")
    # user_name, user_id, logged_in = get_user_from_auth_session(request)
    callback = SUPABASE_GAME_CALLBACK

    return render_template('game.html', **locals())

@app.route("/contract")
def contract():
    return render_template('contract.html')

@app.route("/")
def home():
    return render_template('index.html')

def home_old():
    return render_template('index.html') #now=now, trips=trips, user=user_firstname)

if __name__ == '__main__':
    app.run()

@app.template_filter('parse_json')
def parse_json(value):
    return json.loads(value)

# DISABLED --
# To reduce client download size, return the gzip version when client requests this file
# To enable, use static/js/scriptManager.js to replace playcanvas-stable.js with playcanvas-stable.min2.js
@app.route('/static/lib/playcanvas-stable.min2.js')
def serve_gzipped_js_playcanvas_engine():
    gzipped_path = os.getcwd()+'/elementa'+'/static/lib/playcanvas-stable.min.js.gz'
    @after_this_request
    def add_header(response):
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = os.path.getsize(gzipped_path)
        response.headers['Content-Type'] = 'application/javascript'
        return response
    
    return send_file(gzipped_path)

@app.route('/static/lib/ammo/ammo.wasm.wasm')
def serve_gzipped_js_ammo_wasm():
    gzipped_path = os.getcwd()+'/elementa'+'/static/lib/ammo/ammo.wasm.wasm.gz'
    @after_this_request
    def add_header(response):
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = os.path.getsize(gzipped_path)
        response.headers['Content-Type'] = 'application/javascript'
        return response
    
    return send_file(gzipped_path)

@app.route('/static/lib/ammo/ammo.wasm.js')
def serve_gzipped_js_ammo_wasm_js():
    gzipped_path = os.getcwd()+'/elementa'+'/static/lib/ammo/ammo.wasm.js.jgz'
    @after_this_request
    def add_header(response):
        response.headers['Content-Encoding'] = 'gzip'
        response.headers['Content-Length'] = os.path.getsize(gzipped_path)
        response.headers['Content-Type'] = 'application/javascript'
        return response
    
    return send_file(gzipped_path)

#@app.route('/saveRealm')
#def save_realm(request):
#    if request.method == "POST":
#        ip = get_client_ip(request)
#        geo = get_geo_ip(ip)
#        realm_json = request.POST.get('realmJson')
#        CST = pytz.timezone('US/Central')
#        now = datetime.datetime.now(CST)
#        today = now.strftime("%Y.%m.%d")
#        path = settings.STATICFILES_DIRS[0]+"/highscores/"
#        if not os.path.exists(path): os.makedirs(path)
#        score_file = path+today+".txt"
#        scores = []
#        with open(score_file, 'w'):
#            file.write(f"{realm_json}")
#            file.close()

@app.route('/save', methods=['POST', 'GET'])
def save():

    if request.method == "POST":
        data= request.get_json()
        print(data)

        results = {'processed': 'true'}
        # Get client's IP address
        client_ip = request.remote_addr
        
        # Get today's date
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Create directory for the user
        save_dir = os.path.join(app.root_path, 'static', 'saved_realms')
        print("savedir:"+save_dir)
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)
            print("makedir:"+save_dir)
       

        user_dir = os.path.join(app.root_path, 'static', f'saved_realms/{client_ip}')
        if not os.path.exists(user_dir):
            os.makedirs(user_dir)
            print("makedir2:"+user_dir)
        print("savedir2:"+user_dir)

       
        print('savedir:'+save_dir)
        # Create a file path that increments $NUM if the file already exists
        num = 0
        while num < 100:
            num_str = str(num).zfill(2)
            file_path = os.path.join(user_dir, f'{today}.{num_str}.txt')
            if not os.path.exists(file_path):
                break
            num += 1
        
        # Get JSON data from request
        data = request.json
        
        # Write JSON data to the file
        with open(file_path, 'w') as f:
            f.write(str(data))  # You can format it as needed
        
        # Respond with the filename
        return jsonify({"filename": file_path}), 200 
        return jsonify(results)

# SAVE LOAD LEVELS LevelBuilder
@app.route('/builder/save', methods=['POST'])
def save_builder_data():
    data = request.json.get("data")  # Extract the string sent in the JSON payload
    if not data:
        return jsonify({"error": "No data received"}), 400
    # Handle your data (e.g., save to a database, process it, etc.)
    return jsonify({"message": "Data saved successfully", "length": len(data)}), 200


            
# UTILS
def get_client_ip(request):
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[-1].strip()
    else:
        ip = request.remote_addr
    return ip

def get_geo_ip(ip):
    # was it memoized?
    return "hi" 
    path = settings.STATICFILES_DIRS[0]+"/ip_lookup_table.csv"
    if not os.path.exists(path):
        with open(path, 'w'): pass
    else:
        with open(path, 'r') as file:
            for line in file:
                try: 
                    sline = line.strip().split(',')
                    ip2 = sline[0]
                    geo = sline[1]
                    if ip == ip2:
                        return geo 
                except Exception as e:  
                    pass
    url = f"http://ip-api.com/json/{ip}"
    response = requests.get(url)
    data = response.json()
    geo = "Unknown2"

