'use client'

import { useEffect, useState } from 'react'

const QuantumAnimation = ({ isProcessing }: { isProcessing: boolean }) => {
  const [step, setStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isProcessing) return

    const stepInterval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4)
    }, 2000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => {
      clearInterval(stepInterval)
      clearInterval(dotsInterval)
    }
  }, [isProcessing])

  if (!isProcessing) return null

  const steps = [
    'Preparing dataset for quantum processing',
    'Executing quantum circuit on IBM Quantum hardware',
    'Processing quantum measurement results',
    'Analyzing results'
  ]

  const Circuit = () => (
    <div className="flex justify-center space-x-4 my-4 font-mono">
      {['H', 'X', 'Y'].map((gate, i) => (
        <div
          key={gate}
          className={`w-10 h-10 border-2 border-blue-500 flex items-center justify-center
            ${step === i ? 'bg-blue-500 text-white' : 'text-blue-500'}`}
        >
          {gate}
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mt-4">
      <h3 className="text-xl font-semibold mb-4">Quantum Processing{dots}</h3>
      <Circuit />
      <div className="mt-4">
        {steps.map((text, i) => (
          <div
            key={i}
            className={`py-2 ${
              i === step
                ? 'text-blue-400'
                : i < step
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            {i === step ? `▶ ${text}${dots}` : text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuantumAnimation 