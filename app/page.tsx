'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import QuantumAnimation from './components/QuantumAnimation'
import MoleculeInfo from './components/MoleculeInfo'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [uploadResult, setUploadResult] = useState<any>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles])
      setError(null)
    }
  })

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setLoading(true)
    setError(null)
    setUploadResult(null)

    try {
      const apiUrl = 'https://orchestra-hoa7.onrender.com/upload'
      console.log('Attempting to upload to:', apiUrl)
      
      const formData = new FormData()
      files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, file.name, 'Size:', file.size)
        formData.append('files', file)
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      // Add mock quantum data for demonstration
      const mockQuantumData = {
        ...data,
        nuclear_rejection: 0.865158,
        scf_total_energy: 0.250095,
        max_error: 0.454545,
        rms_gradient: 0.622030,
        smiles: 'NC(=O)c1ccc[n+]([C@@H]2O[C@H](COP(=O)(O)OP(=O)(O)OC[C@H]3O[C@@H](n4cnc5c(N)ncnc54)[C@H](O)[C@@H]3O)[C@@H](O)[C@H]2O)c1.NCCC=O.O|1.2.1.8>>NCCC(=O)O'
      }
      
      setUploadResult(mockQuantumData)
      
      // Mock chart data
      setChartData({
        labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
        datasets: [
          {
            label: 'Training Progress',
            data: [0.2, 0.4, 0.6, 0.8, 0.9],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      })
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload files. Please try again.')
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 8000) // Show quantum animation for 8 seconds
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Orchestra</h1>
          <p className="text-xl text-gray-600">Quantum Machine Learning for Multimodality Enzyme</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'}`}
              >
                <input {...getInputProps()} />
                <p className="text-lg">
                  {isDragActive
                    ? 'Drop the files here'
                    : 'Drag and drop files here, or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: ZIP, CSV, Excel (XLS, XLSX)
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {files.length > 0 && (
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Upload and Analyze'}
                </button>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <QuantumAnimation isProcessing={loading} />
          </div>

          <div className="space-y-8">
            {uploadResult && <MoleculeInfo data={uploadResult} />}

            {chartData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-primary mb-4">Training Progress</h2>
                <div className="h-[300px]">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
} 