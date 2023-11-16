import React, { useState } from 'react';
import GeneralView from './GeneralView';
import FlightDetails from './FlightDetails';

// Inside App.js
function App() {
  const [selectedFlight, setSelectedFlight] = useState(null);

  const handleBack = () => {
    setSelectedFlight(null);
  };

  return (
    <div>
      {selectedFlight ? (
        <FlightDetails flight={selectedFlight} onBack={handleBack} />
      ) : (
        <GeneralView onFlightSelect={setSelectedFlight} />
      )}
    </div>
  );
}

export default App;