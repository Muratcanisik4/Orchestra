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
            "https://orchestra-frontend.vercel.app"  # Your Vercel frontend domain
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure static folder for images
STATIC_FOLDER = 'static'
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)
app.config['STATIC_FOLDER'] = STATIC_FOLDER

def convert_numpy_types(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

def extract_zip(zip_path, extract_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)

def process_files(files):
    data_files = []
    image_files = []
    graph_files = []
    
    for file in files:
        if file.filename.endswith('.zip'):
            # Create a temporary directory for extraction
            temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_' + secure_filename(file.filename))
            os.makedirs(temp_dir, exist_ok=True)
            
            # Save and extract the zip file
            zip_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
            file.save(zip_path)
            extract_zip(zip_path, temp_dir)
            
            # Process extracted files
            for root, _, files in os.walk(temp_dir):
                for f in files:
                    if f.endswith('.csv'):
                        data_files.append(os.path.join(root, f))
                    elif f.endswith('.png'):
                        # Copy image to static folder
                        src_path = os.path.join(root, f)
                        dst_path = os.path.join(app.config['STATIC_FOLDER'], f)
                        shutil.copy2(src_path, dst_path)
                        image_files.append(f)
                        logger.debug(f"Processed image file: {f}")
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
                            logger.debug(f"Processed graph file: {f} -> {json_filename}")
                        except Exception as e:
                            logger.error(f"Error processing graph file {f}: {str(e)}")
            
            # Clean up
            os.remove(zip_path)
            shutil.rmtree(temp_dir)
        elif file.filename.endswith('.csv'):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
            file.save(file_path)
            data_files.append(file_path)
    
    return data_files, image_files, graph_files

def create_performance_plot(results):
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=['Accuracy', 'Inference Time (s)', 'Training Time (s)', 'Model Parameters'],
        y=[
            results['accuracy'],
            results['inference_time'],
            results['training_time'],
            results['model_parameters'] / 1000000  # Convert to millions
        ],
        marker_color=['#4299e1', '#48bb78', '#ed8936', '#e53e3e']
    ))
    fig.update_layout(
        title='Model Performance Metrics',
        xaxis_title='Metric',
        yaxis_title='Value',
        template='plotly_white',
        showlegend=False
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_training_progress_plot():
    # Simulate training progress data
    epochs = list(range(1, 11))
    train_loss = [2.5, 2.0, 1.8, 1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.6]
    val_loss = [2.6, 2.1, 1.9, 1.6, 1.4, 1.2, 1.0, 0.9, 0.8, 0.7]
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=epochs,
        y=train_loss,
        name='Training Loss',
        line=dict(color='#4299e1', width=2)
    ))
    fig.add_trace(go.Scatter(
        x=epochs,
        y=val_loss,
        name='Validation Loss',
        line=dict(color='#48bb78', width=2)
    ))
    fig.update_layout(
        title='Training Progress',
        xaxis_title='Epoch',
        yaxis_title='Loss',
        template='plotly_white',
        showlegend=True
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_confusion_matrix():
    # Simulate confusion matrix data
    labels = ['Class 1', 'Class 2', 'Class 3', 'Class 4']
    matrix = np.array([
        [85, 5, 3, 7],
        [4, 88, 6, 2],
        [2, 4, 90, 4],
        [3, 3, 5, 89]
    ])
    
    fig = go.Figure(data=go.Heatmap(
        z=matrix,
        x=labels,
        y=labels,
        colorscale='Blues',
        text=matrix,
        texttemplate='%{text}',
        textfont={"size": 12}
    ))
    fig.update_layout(
        title='Confusion Matrix',
        xaxis_title='Predicted',
        yaxis_title='Actual',
        template='plotly_white'
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

def create_feature_importance_plot():
    # Simulate feature importance data
    features = ['Sequence Length', 'Molecular Weight', 'Charge', 'Hydrophobicity', 'Secondary Structure']
    importance = [0.35, 0.25, 0.20, 0.15, 0.05]
    
    fig = go.Figure()
    fig.add_trace(go.Bar(
        x=importance,
        y=features,
        orientation='h',
        marker_color='#4299e1'
    ))
    fig.update_layout(
        title='Feature Importance',
        xaxis_title='Importance Score',
        yaxis_title='Feature',
        template='plotly_white',
        showlegend=False
    )
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_file(os.path.join(app.config['STATIC_FOLDER'], filename))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected files'}), 400
    
    try:
        # Process uploaded files
        data_files, image_files, graph_files = process_files(files)
        
        if not data_files:
            return jsonify({'error': 'No valid CSV files found'}), 400
        
        # Read the first CSV file
        df = pd.read_csv(data_files[0])
        first_row = df.iloc[0]
        
        # Debug information
        logger.debug("CSV Columns: %s", df.columns.tolist())
        logger.debug("First row data: %s", first_row.to_dict())
        
        # Find corresponding image and graph files
        image_path = None
        graph_path = None
        graph_adjacency = None
        
        # Sort files to ensure consistent ordering
        image_files.sort()
        graph_files.sort()
        
        if image_files:
            # Use the first image file since we're displaying the first row
            image_path = f"/static/{image_files[0]}"
            logger.debug(f"Using first image file: {image_path}")
        
        if graph_files:
            # Use the first graph file since we're displaying the first row
            graph_file = graph_files[0]
            graph_path = f"/static/{graph_file}"
            logger.debug(f"Using first graph file: {graph_path}")
            
            # Load the graph data from the JSON file
            try:
                json_path = os.path.join(app.config['STATIC_FOLDER'], graph_file)
                logger.debug(f"Loading graph data from: {json_path}")
                with open(json_path, 'r') as f:
                    graph_adjacency = json.load(f)
                logger.debug(f"Successfully loaded graph data, type: {type(graph_adjacency)}")
            except Exception as e:
                logger.error(f"Error loading graph data: {str(e)}")
                # Fallback to CSV data if JSON loading fails
                if 'graph_adjacency' in first_row:
                    try:
                        # Try to parse the string representation of the array
                        graph_str = first_row['graph_adjacency']
                        # Convert string to numpy array
                        graph_array = np.array(eval(graph_str))
                        graph_adjacency = graph_array.tolist()
                        logger.debug("Using graph data from CSV")
                    except Exception as e:
                        logger.error(f"Error parsing graph data from CSV: {str(e)}")
        
        # Debug information about found files
        logger.debug("Available image files: %s", image_files)
        logger.debug("Available graph files: %s", graph_files)
        logger.debug("Selected image path: %s", image_path)
        logger.debug("Selected graph path: %s", graph_path)
        logger.debug("Graph adjacency type: %s", type(graph_adjacency))
        
        # Simulate model processing (replace with actual QVT model)
        results = {
            'accuracy': 85.1,
            'inference_time': 0.15,
            'training_time': 120,
            'model_parameters': 1500000
        }
        
        # Prepare response data
        response_data = {
            'message': 'Files uploaded successfully',
            'results': results,
            'performance_graph': create_performance_plot(results),
            'training_graph': create_training_progress_plot(),
            'confusion_matrix': create_confusion_matrix(),
            'feature_importance': create_feature_importance_plot(),
            # Input data for preview
            'smiles': str(first_row['rxn_smiles']),
            'ec_number': str(first_row['ec']),
            'ec_category': str(first_row['ec_category']),
            'graph_adjacency': graph_adjacency,
            'image_path': image_path,
            'uniprot_id': str(first_row['uniprot_id']),
            'sequence': str(first_row['sequence']),
            # Nuclear properties
            'nuclear_properties': {
                'nuclear_rejection': 0.865158,
                'scf_total': 0.250095,
                'max_error': 0.454545,
                'rms_gradient': 0.62203
            }
        }
        
        # Debug information about response data
        logger.debug("Response data keys: %s", response_data.keys())
        logger.debug("Graph adjacency data type: %s", type(response_data['graph_adjacency']))
        logger.debug("Image path: %s", response_data['image_path'])
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 