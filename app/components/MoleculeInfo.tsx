'use client'

import React, { useState } from 'react'

interface MoleculeInfoProps {
  data: {
    smiles?: string
    ec_number?: string
    ec_category?: string
    image_path?: string
    uniprot_id?: string
    sequence?: string
    nuclear_rejection?: number
    scf_total_energy?: number
    max_error?: number
    rms_gradient?: number
  }
}

const MoleculeInfo = ({ data }: MoleculeInfoProps) => {
  const [showFullSequence, setShowFullSequence] = useState(false)

  const formatSequence = (sequence: string) => {
    if (!showFullSequence) {
      return sequence.slice(0, 100) + '...'
    }
    return sequence
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {data.smiles && (
        <div>
          <h3 className="text-lg font-semibold mb-2">SMILES Representation</h3>
          <p className="font-mono text-sm bg-gray-50 p-3 rounded overflow-x-auto">
            {data.smiles}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">EC Number</h3>
          <p className="text-2xl font-mono">{data.ec_number}</p>
          <p className="text-gray-600">(Category {data.ec_category})</p>
        </div>

        {data.image_path && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Molecular Structure</h3>
            <img
              src={`https://orchestra-hoa7.onrender.com${data.image_path}`}
              alt="Molecular structure"
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          </div>
        )}
      </div>

      {(data.nuclear_rejection || data.scf_total_energy || data.max_error || data.rms_gradient) && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Nuclear Properties</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nuclear Rejection</p>
              <p className="font-mono">{data.nuclear_rejection?.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-600">SCF Total Energy</p>
              <p className="font-mono">{data.scf_total_energy?.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-600">Maximum Error</p>
              <p className="font-mono">{data.max_error?.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-600">RMS Gradient</p>
              <p className="font-mono">{data.rms_gradient?.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {data.sequence && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Protein Sequence
            {data.uniprot_id && (
              <span className="text-sm font-normal ml-2">
                (UniProt ID: {data.uniprot_id})
              </span>
            )}
          </h3>
          <div className="relative">
            <pre className="font-mono text-sm bg-gray-50 p-3 rounded overflow-x-auto">
              {formatSequence(data.sequence)}
            </pre>
            {data.sequence.length > 100 && (
              <button
                onClick={() => setShowFullSequence(!showFullSequence)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                {showFullSequence ? 'Show Less' : 'Show Full Sequence'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MoleculeInfo 