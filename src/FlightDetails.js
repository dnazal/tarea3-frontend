import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function FlightDetails({ flight, onBack }) {
  const [originAirportDetails, setOriginAirportDetails] = useState(null);
  const [destinationAirportDetails, setDestinationAirportDetails] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [sortCriterion, setSortCriterion] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const passengersPerPage = 15;
  const [error, setError] = useState('');

  const calculateAge = (birthDateString) => {
    const birthday = new Date(birthDateString);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const fetchPassengers = async (flightNumber) => {
    try {
      const response = await fetch(`https://tarea3-backend-render.onrender.com/api/passengers/${flightNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const data = await response.json();
      setPassengers(data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
      setError('Failed to load passengers details');
    }
  };

  const fetchAirportDetails = async (airportName) => {
    try {
      const response = await fetch(`https://tarea3-backend-render.onrender.com/api/airport/${encodeURIComponent(airportName)}`);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching airport details:', error);
      setError('Failed to load airport details');
      return null;
    }
  };

  useEffect(() => {
    if (flight) {
      fetchAirportDetails(flight.originAirport).then(setOriginAirportDetails);
      fetchAirportDetails(flight.destinationAirport).then(setDestinationAirportDetails);
      fetchPassengers(flight.flightNumber);
    }
  }, [flight]);

  const sortPassengers = (data) => {
    if (!sortCriterion) return data;
    return [...data].sort((a, b) => {
      let valueA = a[sortCriterion];
      let valueB = b[sortCriterion];

      if (sortCriterion === 'weight(kg)' || sortCriterion === 'height(cm)') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      } else if (sortCriterion === 'birthDate') {
        valueA = calculateAge(valueA);
        valueB = calculateAge(valueB);
      }

      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : 1;
      }
      return valueA > valueB ? -1 : 1;
    });
  };

  const filterPassengers = (data) => {
    if (!searchTerm) return data;
    return data.filter(passenger =>
      `${passenger.firstName} ${passenger.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const changeSort = (criterion) => {
    if (sortCriterion === criterion) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriterion(criterion);
      setSortOrder('asc');
    }
  };

  const displayPassengers = sortPassengers(filterPassengers(passengers));

  const indexOfLastPassenger = currentPage * passengersPerPage;
  const indexOfFirstPassenger = indexOfLastPassenger - passengersPerPage;
  const currentPassengers = displayPassengers.slice(indexOfFirstPassenger, indexOfLastPassenger);
  const totalPages = Math.ceil(displayPassengers.length / passengersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (!flight) {
    return <div>No Flight Selected</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!originAirportDetails || !destinationAirportDetails) {
    return <div>Loading airport details...</div>;
  }

  const positionOrigin = [originAirportDetails.latitude, originAirportDetails.longitude];
  const positionDestination = [destinationAirportDetails.latitude, destinationAirportDetails.longitude];
  const polyline = [positionOrigin, positionDestination];

  const customIcon = L.icon({
    iconUrl: 'airplane-icon.png',
    iconSize: [25, 25],
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
        <input 
          type="text" 
          placeholder="Search Passengers..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th onClick={() => changeSort('firstName')}>Full Name</th>
              <th onClick={() => changeSort('birthDate')}>Age</th>
              <th onClick={() => changeSort('gender')}>Gender</th>
              <th onClick={() => changeSort('weight(kg)')}>Weight (kg)</th>
              <th onClick={() => changeSort('height(cm)')}>Height (cm)</th>
            </tr>
          </thead>
          <tbody>
            {currentPassengers.map((passenger) => (
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
            ))}
          </tbody>
        </table>
        <div>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
            </button>
        </div>
      </div>
    </div>
  );
  
}

export default FlightDetails;
