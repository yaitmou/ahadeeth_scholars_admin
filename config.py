from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from flask import flash

SECRET_KEY = '394b710cab283737f671fd96dd5fbcd0'
USER_NAME = "admin@hbku.com"
PASSWORD = "Hbku_Qu@hadeeth"

MONGO_URI = "mongodb://yaitmou:33you%4088ai@139.59.18.93:27017/?directConnection=true&authMechanism=DEFAULT&authSource=admin"
DB_NAME = "al_ahadeeth_db"

try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DB_NAME]

except ConnectionFailure:
    print("Server not available")