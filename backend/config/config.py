import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-poker'
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5000

config = Config()