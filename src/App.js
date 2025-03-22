import React, { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import {
  // BarChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Base server URL
const BASE_SERVER_URL = 'https://mm-pp-app.onrender.com/';
// const BASE_SERVER_URL = 'http://127.0.0.1:8000';

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
          // Check if this player hasn't played yet
          const notPlayedYet = row.original.pts === 'Not played yet';
          const alive = row.original.alive;

          return (
            <tr
              {...row.getRowProps()}
              key={row.id}
              style={{
                // backgroundColor: notPlayedYet ? 'rgba(232, 232, 232, 0.57)' : 'white',
                opacity: notPlayedYet ? 0.3 : 1,
                backgroundColor: alive === 'No' ? '#ffebee' : 'white', // Light red background if eliminated
                // color: notPlayedYet ? '#999999' : 'black',
              }}
            >
              {row.cells.map(cell => (
                <td
                  {...cell.getCellProps()}
                  key={cell.column.id}
                  style={{
                    padding: '8px',
                    border: 'solid 1px #ddd',
                    fontStyle: notPlayedYet ? 'italic' : 'normal',
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
    fetch(`${BASE_SERVER_URL}/pk/scoreboard`)
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
        Header: 'Guy (click for details)',
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
      {
        Header: "Multiplier Sum",
        accessor: 'sum_multiplier',
      },
      {
        Header: "Players Alive",
        accessor: 'alive_count',

      },
      {
        Header: "Projected Sum Games Remaining After R64",
        accessor: 'sum_games_projected'
      },
      {
        Header: "Projected Sum Games Remaining w/ Multiplier After R64",
        accessor: 'sum_games_projected_multiplier'
      }
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
        sum_multiplier: stats.sum_multiplier || 0,
        alive_count: stats.alive_count || 0,
        sum_games_projected: stats.sum_games_projected || 0,
        sum_games_projected_multiplier: stats.sum_games_projected_multiplier || 0,
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
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/perfect-bracket" style={{ textDecoration: 'underline', color: 'blue' }}>
          View "Perfect Bracket"
        </Link>
      </nav>
    </div>
  );
}

// New component for Perfect Bracket
function PerfectBracket() {
  const [bracketData, setBracketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_SERVER_URL}/perfect_bracket`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setBracketData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Rank',
        accessor: 'rank',
        id: 'rank',
        Cell: ({ row }) => row.index + 1 // Display rank based on index
      },
      {
        Header: 'Player',
        accessor: 'player',
      },
      {
        Header: 'Points w/ Multiplier',
        accessor: 'pts_mult',
      },
      {
        Header: 'Team',
        accessor: 'team',
      },
      {
        Header: 'Picked By',
        accessor: 'entrants',
        // Use Cell renderer to handle empty values
        Cell: ({ value }) => (value ? value : '')
      }
    ],
    []
  );

  if (loading) return <div>Loading perfect bracket data...</div>;
  if (error) return <div>Error loading perfect bracket: {error.message}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to Scoreboard</Link>
      </nav>
      <h1>Perfect Bracket</h1>
      <p>The top 15 players in the tournament and who picked them</p>
      <Table columns={columns} data={bracketData} />
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
    fetch(`${BASE_SERVER_URL}/pk/entrant/${entrantName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(jsonData => {
        const arrayData = Object.entries(jsonData).map(([name, info]) => ({
          name,
          // Create a shorter name version for with first initial and last name
          // e.g., "John Doe" becomes "J. Doe"
          shortName: `${name.split(' ')[0][0]}. ${name.split(' ').slice(1).join(' ')}`,
          pts: info.pts === 'Not played yet' ? 'Not played yet' : info.pts.reduce((total, current) => total + current, 0),
          pts_mult: info.pts_mult,
          seed: info.seed,
          team: info.team,
          alive: info.alive ? 'Yes' : 'No',
        })).sort((a, b) => {
          // Sort by alive first, then by name
          if (a.alive === 'Yes' && b.alive === 'No') return -1;
          if (a.alive === 'No' && b.alive === 'Yes') return 1;
          if (a.pts_mult === 'Not played yet' && b.pts_mult === 'Not played yet') return 0;
          if (a.pts_mult === 'Not played yet') return 1;
          if (b.pts_mult === 'Not played yet') return -1;
          return b.pts_mult - a.pts_mult || a.name.localeCompare(b.name);
        });
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
      {
        Header: 'Name', accessor: 'name',
        Cell: ({ value }) => {
          // turn spaces into dashes for the URL
          const urlName = value.replace(/\s+/g, '-');
          return (
            <Link to={`/player/${urlName}`} style={{ textDecoration: 'underline', color: 'blue' }}>
              {value}
            </Link>
          );
        }
      },
      { Header: 'Points', accessor: 'pts' },
      { Header: 'Points w/ Multiplier', accessor: 'pts_mult' },
      { Header: 'Seed', accessor: 'seed' },
      { Header: 'Team', accessor: 'team' },
      {
        Header: "Alive?", accessor: 'alive'
      },
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
      {/* 
      <h2>Points & Points Multiplier Chart</h2>
      <BarChart
        width={window.innerWidth - 50}
        height={600}
        data={dataArray}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="shortName" // Use shortened names
          tick={{
            fontSize: 10,
            angle: -45, // Rotate labels 45 degrees
            textAnchor: 'end', // Align text properly when rotated
            dy: 10 // Add some vertical offset
          }}
          height={100} // Give more space for the rotated labels
        />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [value, name]}
          labelFormatter={(label, items) => {
            // Find the original full name from the data
            const original = dataArray.find(item => item.shortName === label);
            return original ? original.name : label;
          }}
        />
        <Legend />
        <Bar dataKey="pts" name="Points" fill="#8884d8" />
        <Bar dataKey="pts_mult" name="Points w/ Multiplier" fill="#82ca9d" />
      </BarChart> */}
    </div >
  );
}

// New component to display details for a specific player
function PlayerDetail() {
  const { playerName } = useParams(); // Get player name from URL params
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${BASE_SERVER_URL}/player/${encodeURIComponent(playerName)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setPlayerData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [playerName]);

  if (loading) return <div>Loading player data...</div>;
  if (error) return <div>Error loading player data: {error.message}</div>;
  if (!playerData) return <div>No data available for this player.</div>;

  // Create data for round-by-round chart
  const roundData = playerData.pts.map((points, index) => ({
    round: `Round ${index + 1}`,
    points: points,
    pointsWithMultiplier: playerData.pts_mult_round[index] || 0,
  }));

  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/">← Back to Scoreboard</Link>
      </nav>

      <div className="player-header" style={{
        background: playerData.alive ? '#f0f0f0' : '#ffebee', // Light red background if eliminated
        padding: '15px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h1>{playerData.player}</h1>
        <div style={{ display: 'flex', gap: '30px', marginTop: '10px' }}>
          <div>
            <strong>Team:</strong> {playerData.team}
          </div>
          <div>
            <strong>Seed:</strong> {playerData.seed}
          </div>
          <div>
            <strong>Status:</strong> <span style={{
              color: playerData.alive ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {playerData.alive ? 'Still Alive' : 'Eliminated'}
            </span>
          </div>
          <div>
            <strong>Total Points:</strong> {playerData.pts.reduce((sum, p) => sum + p, 0)}
          </div>
          <div>
            <strong>Total Points w/ Multiplier:</strong> {playerData.pts_mult}
          </div>
        </div>
      </div>

      <h2>Round-by-Round Performance</h2>
      <ResponsiveContainer width={'70%'} height={400}>
        <ComposedChart
          width={window.innerWidth - 50}
          height={400}
          data={roundData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [value, name]}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Bar dataKey="points" name="Points" fill="#8884d8" barSize={30} />
          <Line dataKey="pointsWithMultiplier" name="Points w/ Multiplier" fill="#82ca9d" />
        </ComposedChart>
      </ResponsiveContainer>
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
          <Route path="/player/:playerName" element={<PlayerDetail />} />
          <Route path="/perfect-bracket" element={<PerfectBracket />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;