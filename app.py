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
            "https://orchestra-git-master-murat-isiks-projects.vercel.app",
            "https://orchestra-36c3410dn-murat-isiks-projects.vercel.app",
            "https://orchestra-frontend.vercel.app",
            "https://orchestra-bice.vercel.app"
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

# Configure maximum file size (16MB)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "message": "Orchestra API is running"
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files part'}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            return jsonify({'error': 'No selected files'}), 400
        
        # Process uploaded files
        data_files, image_files, graph_files = process_files(files)
        
        if not data_files:
            return jsonify({'error': 'No valid CSV files found'}), 400
        
        # Read the first CSV file
        df = pd.read_csv(data_files[0])
        first_row = df.iloc[0]
        
        # Debug information
        logger.info("CSV Columns: %s", df.columns.tolist())
        logger.info("First row data: %s", first_row.to_dict())
        
        # Find corresponding image and graph files
        image_path = None
        graph_path = None
        graph_adjacency = None
        
        # Sort files to ensure consistent ordering
        image_files.sort()
        graph_files.sort()
        
        if image_files:
            image_path = f"/static/{image_files[0]}"
            logger.info(f"Using first image file: {image_path}")
        
        if graph_files:
            graph_file = graph_files[0]
            graph_path = f"/static/{graph_file}"
            logger.info(f"Using first graph file: {graph_path}")
            
            try:
                json_path = os.path.join(app.config['STATIC_FOLDER'], graph_file)
                logger.info(f"Loading graph data from: {json_path}")
                with open(json_path, 'r') as f:
                    graph_adjacency = json.load(f)
                logger.info(f"Successfully loaded graph data, type: {type(graph_adjacency)}")
            except Exception as e:
                logger.error(f"Error loading graph data: {str(e)}")
                if 'graph_adjacency' in first_row:
                    try:
                        graph_str = first_row['graph_adjacency']
                        graph_array = np.array(eval(graph_str))
                        graph_adjacency = graph_array.tolist()
                        logger.info("Using graph data from CSV")
                    except Exception as e:
                        logger.error(f"Error parsing graph data from CSV: {str(e)}")
        
        # Prepare response data
        response_data = {
            'message': 'Files uploaded successfully',
            'smiles': str(first_row['rxn_smiles']),
            'ec_number': str(first_row['ec']),
            'ec_category': str(first_row['ec_category']),
            'graph_adjacency': graph_adjacency,
            'image_path': image_path,
            'uniprot_id': str(first_row['uniprot_id']),
            'sequence': str(first_row['sequence'])
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ... rest of your existing code from website/app.py ... 