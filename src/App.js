// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>
//             Hello from Render!
//           </p>
//           <a
//             className="App-link"
//             href="https://reactjs.org"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Learn React
//           </a>
//         </header>
//       </div>
//     );
//   }
// }

// export default App;

// const rawData = {
//   "BJ DAVIS": {
//     "pts": [9],
//     "pts_mult": 18,
//     "seed": "11",
//     "team": "San Diego State Aztecs"
//   },
//   "BOBBY ROSENBERGER": {
//     "pts": [0],
//     "pts_mult": 0,
//     "seed": "16",
//     "team": "St. Francis (PA) Red Flash"
//   },
//   // ... rest of your data
// };

import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
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

function Dashboard() {
  // State to hold fetched data
  const [dataArray, setDataArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch data from localhost if running locally
    // Otherwise, fetch from the deployed URL
    fetch('https://mm-pp-app.onrender.com/entrant/zsg') // Replace with your API URL
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => {
        // Convert the received JSON into an array format
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
  }, []);

  // Define columns for react-table using useMemo inside the component
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
      <h1>Player Data</h1>
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

export default Dashboard;