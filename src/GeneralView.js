import React, { useState, useEffect } from 'react';
import './App.css';

function GeneralView({ onFlightSelect }) {
  const [flightsData, setFlightsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterFlightNumber, setFilterFlightNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriterion, setSortCriterion] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:3000/api/flights?page=${currentPage}`)
      .then(response => response.json())
      .then(data => {
        setFlightsData(data.flights);
        setTotalPages(data.totalPages);
      })
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setIsLoading(false));
  }, [currentPage]);

  const uniqueYears = Array.from(new Set(flightsData.map(flight => flight.year))).sort();
  const uniqueMonths = Array.from(new Set(flightsData.map(flight => flight.month))).sort();
  const uniqueFlightNumbers = Array.from(new Set(flightsData.map(flight => flight.flightNumber))).sort();

  const sortData = (data) => {
    if (!sortCriterion) return data;
    return [...data].sort((a, b) => {
      const valueA = a[sortCriterion];
      const valueB = b[sortCriterion];
      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : 1;
      }
      return valueA > valueB ? -1 : 1;
    });
  };

  const searchFilter = (data) => {
    if (!searchTerm) return data;
    return data.filter(flight => 
      Object.values(flight).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filterData = () => {
    return searchFilter(flightsData)
      .filter(flight => !filterYear || flight.year === filterYear)
      .filter(flight => !filterMonth || flight.month === filterMonth)
      .filter(flight => !filterFlightNumber || flight.flightNumber === filterFlightNumber);
  };

  const displayData = sortData(filterData());

  const handlePrevPage = () => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : prev);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev < totalPages ? prev + 1 : prev);
  };

  const changeSort = (criterion) => {
    if (sortCriterion === criterion) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriterion(criterion);
      setSortOrder('asc');
    }
  };

  const handleRowClick = (flight) => {
    onFlightSelect(flight);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Flight Data</h2>
        <div className="filters">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">All Months</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <select value={filterFlightNumber} onChange={e => setFilterFlightNumber(e.target.value)}>
            <option value="">All Flight Numbers</option>
            {uniqueFlightNumbers.map(number => (
              <option key={number} value={number}>{number}</option>
            ))}
          </select>
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => changeSort('originAirport')}>Airport of Origin</th>
                    <th onClick={() => changeSort('destinationAirport')}>Airport of Destination</th>
                    <th onClick={() => changeSort('airline')}>Airline</th>
                    <th onClick={() => changeSort('averageAge')}>Average Age of Passengers</th>
                    <th onClick={() => changeSort('distance')}>Distance Traveled</th>
                    <th onClick={() => changeSort('aircraftName')}>Aircraft Name</th>
                    <th onClick={() => changeSort('passengerCount')}>Number of Passengers</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((flight, index) => (
                    <tr key={index} onClick={() => handleRowClick(flight)}>
                      <td>{flight.originAirport}</td>
                      <td>{flight.destinationAirport}</td>
                      <td>{flight.airline}</td>
                      <td>{flight.averageAge}</td>
                      <td>{flight.distance}</td>
                      <td>{flight.aircraftName}</td>
                      <td>{flight.passengerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}  

export default GeneralView;
