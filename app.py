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

# Simplified CORS configuration
CORS(app, resources={r"/*": {"origins": "*"}})

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
        logger.info("Received upload request")
        logger.info("Request headers: %s", dict(request.headers))
        
        if 'files' not in request.files:
            logger.error("No files part in request")
            return jsonify({'error': 'No files part'}), 400
        
        files = request.files.getlist('files')
        if not files or files[0].filename == '':
            logger.error("No selected files")
            return jsonify({'error': 'No selected files'}), 400
        
        logger.info("Processing %d files", len(files))
        for file in files:
            logger.info("File: %s, Size: %d bytes, Content-Type: %s", 
                       file.filename, len(file.read()), file.content_type)
            file.seek(0)  # Reset file pointer after reading
        
        try:
            # Process uploaded files
            data_files, image_files, graph_files = process_files(files)
            
            if not data_files:
                logger.error("No valid CSV files found")
                return jsonify({'error': 'No valid CSV files found'}), 400
            
            logger.info("Found %d data files, %d image files, %d graph files", 
                       len(data_files), len(image_files), len(graph_files))
            
            # Read the first CSV file
            try:
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
                
                logger.info("Sending response: %s", response_data)
                return jsonify(response_data)
                
            except Exception as e:
                logger.error(f"Error processing CSV file: {str(e)}")
                return jsonify({'error': f'Error processing CSV file: {str(e)}'}), 500
                
        except Exception as e:
            logger.error(f"Error processing files: {str(e)}")
            return jsonify({'error': f'Error processing files: {str(e)}'}), 500
    
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

def process_files(files):
    data_files = []
    image_files = []
    graph_files = []
    
    for file in files:
        logger.info(f"Processing file: {file.filename}, Content-Type: {file.content_type}")
        
        if file.filename.endswith('.zip'):
            try:
                # Create a temporary directory for extraction
                temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_' + secure_filename(file.filename))
                os.makedirs(temp_dir, exist_ok=True)
                logger.info(f"Created temp directory: {temp_dir}")
                
                # Save and extract the zip file
                zip_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
                file.save(zip_path)
                logger.info(f"Saved zip file to: {zip_path}")
                
                try:
                    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                        zip_ref.extractall(temp_dir)
                    logger.info(f"Successfully extracted zip file to: {temp_dir}")
                except Exception as e:
                    logger.error(f"Error extracting zip file: {str(e)}")
                    raise
                
                # Process extracted files
                for root, _, files in os.walk(temp_dir):
                    for f in files:
                        logger.info(f"Found extracted file: {f}")
                        if f.endswith('.csv'):
                            data_files.append(os.path.join(root, f))
                            logger.info(f"Added CSV file: {f}")
                        elif f.endswith('.png'):
                            # Copy image to static folder
                            src_path = os.path.join(root, f)
                            dst_path = os.path.join(app.config['STATIC_FOLDER'], f)
                            shutil.copy2(src_path, dst_path)
                            image_files.append(f)
                            logger.info(f"Processed image file: {f}")
                        elif f.endswith('.npy'):
                            try:
                                # Load and convert numpy array to JSON
                                src_path = os.path.join(root, f)
                                graph_data = np.load(src_path)
                                graph_json = json.dumps(convert_numpy_types(graph_data))
                                # Create JSON filename by replacing .npy with .json
                                json_filename = f.replace('.npy', '.json')
                                dst_path = os.path.join(app.config['STATIC_FOLDER'], json_filename)
                                with open(dst_path, 'w') as json_file:
                                    json_file.write(graph_json)
                                graph_files.append(json_filename)
                                logger.info(f"Processed graph file: {f} -> {json_filename}")
                            except Exception as e:
                                logger.error(f"Error processing graph file {f}: {str(e)}")
                
                # Clean up
                os.remove(zip_path)
                shutil.rmtree(temp_dir)
                logger.info("Cleaned up temporary files")
                
            except Exception as e:
                logger.error(f"Error processing zip file: {str(e)}")
                raise
                
        elif file.filename.endswith('.csv'):
            try:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
                file.save(file_path)
                data_files.append(file_path)
                logger.info(f"Saved CSV file: {file_path}")
            except Exception as e:
                logger.error(f"Error saving CSV file: {str(e)}")
                raise
    
    logger.info(f"Processed files summary - CSV: {len(data_files)}, Images: {len(image_files)}, Graphs: {len(graph_files)}")
    return data_files, image_files, graph_files

# ... rest of your existing code from website/app.py ... 