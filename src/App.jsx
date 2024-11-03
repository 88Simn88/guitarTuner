import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import InstrumentsTuner from './InstrumentsTuner'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
   <InstrumentsTuner />
    </>
  )
}

export default App
