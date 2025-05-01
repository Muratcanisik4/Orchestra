# QVT Model Platform

A web platform for running Quantum Vision Transformer (QVT) models on enzyme classification tasks. This platform allows users to upload CSV datasets and view model performance metrics including accuracy, inference time, training time, and model parameters.

## Features

- CSV file upload with drag-and-drop support
- Real-time model performance visualization
- Responsive design with modern UI
- TypeScript support for type safety
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Prepare your CSV dataset with the required format
2. Drag and drop the CSV file onto the upload area or click to select a file
3. Wait for the model to process the data
4. View the results in the performance metrics chart

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Chart.js
- React Dropzone
- Heroicons 