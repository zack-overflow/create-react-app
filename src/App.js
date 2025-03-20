import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Table component using react-table
function Table({ columns, data }) {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table
      {...getTableProps()}
      style={{ border: 'solid 1px black', width: '100%', marginBottom: '2rem' }}
    >
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
                key={column.id}
                style={{
                  borderBottom: 'solid 3px #ddd',
                  background: '#f0f0f0',
                  color: 'black',
                  fontWeight: 'bold',
                  padding: '8px'
                }}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map(cell => (
                <td
                  {...cell.getCellProps()}
                  key={cell.column.id}
                  style={{
                    padding: '8px',
                    border: 'solid 1px #ddd'
                  }}
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Scoreboard component that will be shown at the root route
function Scoreboard() {
  const [scoreboardData, setScoreboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://mm-pp-app.onrender.com/pk/scoreboard')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setScoreboardData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Define columns for scoreboard table with a link in the entrant name column
  const columns = useMemo(
    () => [
      {
        Header: 'Entrant Name',
        accessor: 'entrantName',
        // Custom cell renderer to make the entrant name a clickable link
        Cell: ({ value }) => (
          <Link to={`/entrant/${value}`} style={{ textDecoration: 'underline', color: 'blue' }}>
            {value}
          </Link>
        )
      },
      {
        Header: 'Score',
        accessor: 'score',
        // Sort by score in descending order (highest first)
        sortDescFirst: true
      },
    ],
    []
  );

  // FIXED: Move useMemo before any conditional returns
  const scoreboardArray = useMemo(() => {
    if (!scoreboardData || typeof scoreboardData !== 'object') return [];
    return Object.entries(scoreboardData)
      .map(([entrantName, stats]) => ({
        entrantName,
        score: stats.score || 0,
      }))
      .sort((a, b) => b.score - a.score); // Sort by score in descending order
  }, [scoreboardData]);

  // Conditional rendering after hooks
  if (loading) return <div>Loading scoreboard...</div>;
  if (error) return <div>Error loading scoreboard: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>March Madness Scoreboard</h1>
      <Table columns={columns} data={scoreboardArray} />
    </div>
  );
}

// Updated Dashboard component to accept an entrant parameter from URL
function EntrantDetail() {
  const { entrantName } = useParams(); // Get entrant name from URL params
  const [dataArray, setDataArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://mm-pp-app.onrender.com/pk/entrant/${entrantName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => {
        const arrayData = Object.entries(jsonData).map(([name, info]) => ({
          name,
          pts: info.pts[0],
          pts_mult: info.pts_mult,
          seed: info.seed,
          team: info.team
        }));
        setDataArray(arrayData);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [entrantName]);

  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Points', accessor: 'pts' },
      { Header: 'Points w/ Multiplier', accessor: 'pts_mult' },
      { Header: 'Seed', accessor: 'seed' },
      { Header: 'Team', accessor: 'team' }
    ],
    []
  );

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to Scoreboard</Link>
      </nav>

      <h1>Players: {entrantName}</h1>
      <Table columns={columns} data={dataArray} />

      <h2>Points & Points Multiplier Chart</h2>
      <BarChart
        width={800}
        height={400}
        data={dataArray}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 8 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pts" name="Points" fill="#8884d8" />
        <Bar dataKey="pts_mult" name="Points w/ Multiplier" fill="#82ca9d" />
      </BarChart>
    </div>
  );
}

// Main App component with routes
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Scoreboard />} />
          <Route path="/entrant/:entrantName" element={<EntrantDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;