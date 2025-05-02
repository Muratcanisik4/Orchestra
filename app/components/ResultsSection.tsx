'use client'

import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ResultsSectionProps {
  data: {
    performance?: {
      accuracy: number
      precision: number
      recall: number
      f1Score: number
    }
    trainingProgress?: {
      labels: string[]
      trainingLoss: number[]
      validationLoss: number[]
    }
    confusionMatrix?: {
      labels: string[]
      data: number[][]
    }
    featureImportance?: {
      labels: string[]
      data: number[]
    }
  }
}

const ResultsSection = ({ data }: ResultsSectionProps) => {
  // Model Performance
  const modelPerformance: ChartData<'bar'> = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [
      {
        label: 'Model Metrics',
        data: [
          data.performance?.accuracy || 0.92,
          data.performance?.precision || 0.89,
          data.performance?.recall || 0.88,
          data.performance?.f1Score || 0.90
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ]
      }
    ]
  }

  // Training Progress
  const trainingProgress: ChartData<'line'> = {
    labels: data.trainingProgress?.labels || ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    datasets: [
      {
        label: 'Training Loss',
        data: data.trainingProgress?.trainingLoss || [0.8, 0.6, 0.4, 0.3, 0.2],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Validation Loss',
        data: data.trainingProgress?.validationLoss || [0.85, 0.7, 0.5, 0.45, 0.4],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  // Confusion Matrix
  const confusionMatrix: ChartData<'bar'> = {
    labels: data.confusionMatrix?.labels || ['Predicted 0', 'Predicted 1'],
    datasets: [
      {
        label: 'Actual 0',
        data: data.confusionMatrix?.data?.[0] || [85, 15],
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      },
      {
        label: 'Actual 1',
        data: data.confusionMatrix?.data?.[1] || [10, 90],
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  }

  // Feature Importance
  const featureImportance: ChartData<'bar'> = {
    labels: data.featureImportance?.labels || [
      'Molecular Weight',
      'Charge',
      'Bond Count',
      'Ring Count',
      'H Acceptors',
      'H Donors'
    ],
    datasets: [
      {
        label: 'Feature Importance',
        data: data.featureImportance?.data || [0.85, 0.72, 0.68, 0.55, 0.48, 0.42],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  }

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1
      }
    }
  }

  const lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false
  }

  const stackedBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  }

  const horizontalBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Performance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Model Performance</h3>
            <div className="h-[300px]">
              <Bar data={modelPerformance} options={barOptions} />
            </div>
          </div>

          {/* Training Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
            <div className="h-[300px]">
              <Line data={trainingProgress} options={lineOptions} />
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
            <div className="h-[300px]">
              <Bar data={confusionMatrix} options={stackedBarOptions} />
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
            <div className="h-[300px]">
              <Bar data={featureImportance} options={horizontalBarOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsSection 