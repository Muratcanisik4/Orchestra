'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0])
      setError(null)
    }
  })

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('files', file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
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
            {file ? (
              <p className="text-lg">Selected file: {file.name}</p>
            ) : (
              <p className="text-lg">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag and drop a CSV or Excel file here, or click to select'}
              </p>
            )}
          </div>

          {file && (
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
                      text: 'Data Analysis',
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 