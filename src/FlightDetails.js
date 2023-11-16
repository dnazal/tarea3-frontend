import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FlightDetails({ flight, onBack }) {
  const [originAirportDetails, setOriginAirportDetails] = useState(null);
  const [destinationAirportDetails, setDestinationAirportDetails] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [error, setError] = useState('');



  const calculateAge = (birthDateString) => {
    const birthday = new Date(birthDateString.split(' de ').reverse());
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const fetchPassengers = async (flightNumber) => {
    try {
      const response = await fetch(`http://localhost:3000/api/passengers/${flightNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();
      setPassengers(data); // Make sure your backend is responding with an array here
    } catch (error) {
      console.error('Error fetching passengers:', error);
      setError('Failed to load passengers details');
    }
  };
  

  const fetchAirportDetails = async (airportName) => {
    try {
      const response = await fetch(`http://localhost:3000/api/airport/${encodeURIComponent(airportName)}`);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      return data; // This should be an object with { name, latitude, longitude }
    } catch (error) {
      console.error('Error fetching airport details:', error);
      setError('Failed to load airport details');
      return null; // or you can return a default object
    }
  };

  useEffect(() => {
    if (flight) {
      fetchAirportDetails(flight.originAirport).then(setOriginAirportDetails);
      fetchAirportDetails(flight.destinationAirport).then(setDestinationAirportDetails);
      fetchPassengers(flight.flightNumber);
    }
  }, [flight]); // Rerun when flight changes

  if (!flight) {
    return <div>No Flight Selected</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!originAirportDetails || !destinationAirportDetails) {
    return <div>Loading airport details...</div>;
  }

  // Define positions for origin and destination airports
  const positionOrigin = [originAirportDetails.latitude, originAirportDetails.longitude];
  const positionDestination = [destinationAirportDetails.latitude, destinationAirportDetails.longitude];

  // Define polyline for flight path
  const polyline = [positionOrigin, positionDestination];

  // Custom icon for markers (optional)
  const customIcon = L.icon({
    iconUrl: 'airplane-icon.png', // Replace with your icon path
    iconSize: [25, 25], // Size of the icon
  });

  return (
    <div>
      <button onClick={onBack}>Back to Flights List</button>
      <h2>Flight Details</h2>
      <MapContainer center={positionOrigin} zoom={5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={positionOrigin} icon={customIcon}>
          <Popup>
            <strong>{originAirportDetails.name}</strong><br/>
            Latitude: {originAirportDetails.latitude}<br/>
            Longitude: {originAirportDetails.longitude}
          </Popup>
        </Marker>
        <Marker position={positionDestination} icon={customIcon}>
          <Popup>
            <strong>{destinationAirportDetails.name}</strong><br/>
            Latitude: {destinationAirportDetails.latitude}<br/>
            Longitude: {destinationAirportDetails.longitude}
          </Popup>
        </Marker>
        <Polyline positions={polyline} color="blue">
          <Popup>
            Flight Number: {flight.flightNumber}<br/>
            Aircraft: {flight.aircraftName}<br/>
            Distance: {flight.distance}
          </Popup>
        </Polyline>
      </MapContainer>
      <div>
        <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
        <p><strong>Airline:</strong> {flight.airline}</p>
        <p><strong>Aircraft:</strong> {flight.aircraftName}</p>
        <p><strong>Distance:</strong> {flight.distance} km</p>
      </div>
      <div>
        <h3>Passengers</h3>
        <table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            {passengers.length > 0 ? (
              passengers.map((passenger) => (
                <tr key={passenger.passengerID}>
                  <td>
                    <img src={passenger.avatar} alt={`${passenger.firstName} ${passenger.lastName}`} style={{ width: '50px', height: '50px' }} />
                  </td>
                  <td>{`${passenger.firstName} ${passenger.lastName}`}</td>
                  <td>{calculateAge(passenger.birthDate)}</td>
                  <td>{passenger.gender}</td>
                  <td>{passenger['weight(kg)']}</td>
                  <td>{passenger['height(cm)']}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Loading passengers...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FlightDetails;
