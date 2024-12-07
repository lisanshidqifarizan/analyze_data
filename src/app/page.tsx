'use client';

import React, { useState } from 'react';

type DataRow = Record<string, string>;

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to analyze file');

      const result = await res.json();
      setAnalysis(result.data);
    } catch (err) {
      setError((err as Error).message || 'Error analyzing file');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...analysis].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setAnalysis(sortedData);
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <h1>Data File Analysis</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv,.data,.clsx" onChange={handleFileUpload} />
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <h2>Analysis Results</h2>
        {analysis.length > 0 ? (
          <table border="1">
            <thead>
              <tr>
                {Object.keys(analysis[0]).map((key) => (
                  <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                    {key} {sortConfig?.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
