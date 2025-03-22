import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom'
import BASE_SERVER_URL from '../config';

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

export default PlayerDetail;