// src/components/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/groups')
            .then(response => {
                setGroups(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error fetching the groups!', error);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Groups</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {groups.map(group => (
                    <div key={group.id} style={{ border: '1px solid #ccc', borderRadius: '8px', margin: '10px', padding: '10px', width: '200px' }}>
                        <h3>{group.title}</h3>
                        <p>Number of students: {group.students.length}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
