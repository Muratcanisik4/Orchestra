from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import pandas as pd
import plotly
import plotly.express as px
import plotly.graph_objects as go
import numpy as np
import json
import os
import zipfile
import shutil
import logging
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS for production
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://orchestra-frontend.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure static folder for images
STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)
app.config['STATIC_FOLDER'] = STATIC_FOLDER

# ... rest of your existing code from website/app.py ... 