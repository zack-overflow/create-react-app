import { useTable } from 'react-table';

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

export default Table;