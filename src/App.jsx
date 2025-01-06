import React from 'react'
import PracticeTracker from './components/PracticeTracker'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Practice Tracker</h1>
        <PracticeTracker />
      </div>
    </div>
  )
}

export default App
