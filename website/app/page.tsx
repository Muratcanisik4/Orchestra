'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<{
    accuracy: number;
    inferenceTime: number;
    trainingTime: number;
    modelParameters: number;
  } | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      // Simulate model processing
      setTimeout(() => {
        setResults({
          accuracy: 85.1,
          inferenceTime: 0.15,
          trainingTime: 120,
          modelParameters: 1500000,
        });
      }, 2000);
    },
  });

  const chartData = results ? {
    labels: ['Accuracy', 'Inference Time (s)', 'Training Time (s)', 'Model Parameters'],
    datasets: [
      {
        label: 'Model Metrics',
        data: [
          results.accuracy,
          results.inferenceTime,
          results.trainingTime,
          results.modelParameters / 1000000, // Convert to millions
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        QVT Model Platform
      </h1>
      
      <div className="max-w-2xl mx-auto">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'}`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">
            {isDragActive
              ? 'Drop the CSV file here'
              : 'Drag and drop a CSV file here, or click to select'}
          </p>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-accent" />
              <span className="ml-2 text-gray-700">{file.name}</span>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Results</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <Bar
                data={chartData!}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: 'Model Performance Metrics',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 