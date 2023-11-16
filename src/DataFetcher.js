import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DataFetcher = () => {
  const bucketName = '2023-2-tarea3';
  const projectId = 'taller-integracion-310700';
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // La URL de abajo es un ejemplo, deberás reemplazarla con la URL correcta de la API de GCP.
  const storageUrl = `https://storage.googleapis.com/${bucketName}/${projectId}`;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // La autenticación no está implementada aquí. Deberías usar un método seguro para manejar las claves.
        const response = await axios.get(storageUrl);
        setData(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  return (
    <div>
      <h1>Data Fetched from GCP</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default DataFetcher;
