import json
import sqlite3
from flask import g, jsonify
import os

DATABASE = 'mathbreakers.db'

def get_db():
    # Change the current directory to the directory of db.py
    db_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(db_dir)
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    print('got db')
    return db

def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    cursor = db.cursor()

    # NOTE : If Json becomes unwrangleable, suggest storing it in an object storage .json file service with a ref instead
    cursor.executescript('''
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS realms;
        DROP TABLE IF EXISTS realm_versions;
        DROP TABLE IF EXISTS realm_editors;
        DROP TABLE IF EXISTS classrooms;
        DROP TABLE IF EXISTS classroom_realms;
        DROP TABLE IF EXISTS classroom_users;
        DROP TABLE IF EXISTS user_activities;
        DROP TABLE IF EXISTS user_progress;
        DROP TABLE IF EXISTS user_avatars;

        CREATE TABLE users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE
        );

        CREATE TABLE realms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            realm_id TEXT UNIQUE,
            name TEXT,
            json_data BLOB,
            date_created DATETIME,
            date_updated DATETIME,
            short_link TEXT UNIQUE,
            creator_id TEXT,
            waypoints TEXT,
            FOREIGN KEY (creator_id) REFERENCES users (user_id)
        );

        CREATE TABLE realm_versions (
            version_id INTEGER PRIMARY KEY AUTOINCREMENT,
            realm_id VARCHAR,
            json_data BLOB,
            date_created DATETIME,
            FOREIGN KEY (realm_id) REFERENCES realms (realm_id)
        );

        CREATE TABLE realm_editors (
            realm_id VARCHAR,
            user_id TEXT,
            PRIMARY KEY (realm_id, user_id),
            FOREIGN KEY (realm_id) REFERENCES realms (realm_id),
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        );

        CREATE TABLE classrooms (
            classroom_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            owner_id TEXT,
            date_created DATETIME,
            FOREIGN KEY (owner_id) REFERENCES users (user_id)
        );

        CREATE TABLE classroom_realms (
            classroom_id INTEGER,
            realm_id VARCHAR,
            PRIMARY KEY (classroom_id, realm_id),
            FOREIGN KEY (classroom_id) REFERENCES classrooms (classroom_id),
            FOREIGN KEY (realm_id) REFERENCES realms (realm_id)
        );

        CREATE TABLE classroom_users (
            classroom_id INTEGER,
            user_id TEXT,
            PRIMARY KEY (classroom_id, user_id),
            FOREIGN KEY (classroom_id) REFERENCES classrooms (classroom_id),
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        );

        CREATE TABLE user_activities (
            activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            realm_id VARCHAR,
            activity_type TEXT,
            json_data BLOB,
            date_created DATETIME,
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (realm_id) REFERENCES realms (realm_id)
        );

        CREATE TABLE user_progress (
            progress_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            realm_id VARCHAR,
            last_waypoint TEXT,
            inventory BLOB,
            date_reached DATETIME,
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (realm_id) REFERENCES realms (realm_id)
        );

        CREATE TABLE user_avatars (
            avatar_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            json_data BLOB,
            version INTEGER,
            metadata TEXT,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
    ''')
    db.commit()

def save_realm(data):
    
    realm_id = data.get("realm_id")
    print("Realmid:"+realm_id)
    name = data.get("name")
    realmData = str(data.get("realmData"))
    print("RED:"+str(realmData))
    creator_id = data.get("creator_id")
    short_link = data.get("short_link")
    waypoints = str(data.get("waypoints"))
    
    db = get_db()
    cursor = db.cursor()
   
    cursor.execute(
        "INSERT OR IGNORE INTO realms (realm_id,name,json_data,creator_id) VALUES (?,?,?,?)",
        (realm_id,name,realmData,creator_id)
    )
    cursor.execute(
        "UPDATE realms SET name = ?, json_data = ? where realm_id = ?",
        (name,realmData,realm_id)
    )
    db.commit()
    return {"status": "Realm saved successfully"}

def get_realm_by_realm_id(realm_id=None):
    db = get_db()
    cursor = db.cursor()

    if realm_id:
        cursor.execute("SELECT * FROM realms WHERE realm_id = ?", (realm_id,))
#    elif short_link:
#        cursor.execute("SELECT * FROM realms WHERE short_link = ?", (short_link,))
#    elif classroom_id:
#        cursor.execute('''SELECT r.* FROM realms r 
#                          JOIN classroom_realms cr ON r.realm_id = cr.realm_id 
#                          JOIN classrooms c ON cr.classroom_id = c.classroom_id 
#                          WHERE c.classroom_id = ? AND EXISTS 
#                          (SELECT 1 FROM classroom_users cu WHERE cu.classroom_id = c.classroom_id AND cu.user_id = ?)''',
#                       (classroom_id, user_id))
    else:
        return {"status": "Invalid load request"}

    columns = [column[0] for column in cursor.description]
    results = []
    row = cursor.fetchone()
    realm = dict(zip(columns, row))
    return realm


def get_user(user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    return cursor.fetchone()

def create_user(user_id, email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO users (user_id, email) VALUES (?, ?)", (user_id, email))
    db.commit()

def get_realm_by_name_and_user(realm_name, user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "SELECT * FROM realms WHERE name = ? AND creator_id = ?",
        (realm_name, user_id)
    )
    return cursor.fetchone()

def update_realm(realm_id, realm_json):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE realms SET json_data = ?, date_updated = CURRENT_TIMESTAMP WHERE realm_id = ?",
        (realm_json, realm_id)
    )
    db.commit()

def get_realms(user_id):
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT name, realm_id FROM realms WHERE creator_id = '"+user_id+"'")
    columns = [column[0] for column in cursor.description]
    results = []
    for row in cursor.fetchall():
        results.append(dict(zip(columns, row)))
    return results

    
