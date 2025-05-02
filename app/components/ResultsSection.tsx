'use client'

import { Line, Bar, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
  data: any // Replace with proper type when backend provides actual data structure
}

const ResultsSection = ({ data }: ResultsSectionProps) => {
  // Mock data for visualizations
  const trainingProgress = {
    labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    datasets: [
      {
        label: 'Training Loss',
        data: [0.8, 0.6, 0.4, 0.3, 0.2],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Validation Loss',
        data: [0.85, 0.7, 0.5, 0.45, 0.4],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  const modelPerformance = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score'],
    datasets: [
      {
        label: 'Model Metrics',
        data: [0.92, 0.89, 0.88, 0.90],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ]
      }
    ]
  }

  const confusionMatrix = {
    labels: ['Predicted 0', 'Predicted 1'],
    datasets: [
      {
        label: 'Actual 0',
        data: [85, 15],
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      },
      {
        label: 'Actual 1',
        data: [10, 90],
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  }

  const featureImportance = {
    labels: [
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
        data: [0.85, 0.72, 0.68, 0.55, 0.48, 0.42],
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
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
              <Bar
                data={modelPerformance}
                options={{
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
                }}
              />
            </div>
          </div>

          {/* Training Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Training Progress</h3>
            <div className="h-[300px]">
              <Line
                data={trainingProgress}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Confusion Matrix</h3>
            <div className="h-[300px]">
              <Bar
                data={confusionMatrix}
                options={{
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
                }}
              />
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Feature Importance</h3>
            <div className="h-[300px]">
              <Bar
                data={featureImportance}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y' as const,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsSection 