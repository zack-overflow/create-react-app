import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom'
import Table from './Table'; // Assuming you have a Table component
import BASE_SERVER_URL from '../config';

function EntrantDetail() {
    const { entrantName } = useParams(); // Get entrant name from URL params
    const [dataArray, setDataArray] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${BASE_SERVER_URL}/entrant/${entrantName}`)
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

export default EntrantDetail;