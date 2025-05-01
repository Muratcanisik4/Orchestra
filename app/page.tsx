'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any>(null)

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
        headers: {
          'Accept': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error response:', errorData)
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Upload response:', data)
      
      if (data.chart_data) {
        setChartData(data.chart_data)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload files. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Orchestra Framework</h1>
        
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

        {chartData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">Analysis Results</h2>
            <div className="h-[400px]">
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
                      display: true,
                      text: 'Analysis Results'
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 