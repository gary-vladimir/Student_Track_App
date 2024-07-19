// src/components/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import decoration from '../assets/search_app_decoration.svg';

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
        return <div className="text-center text-xl">Loading...</div>;
    }

    return (
        <div className="">
            <h1 className="text-5xl font-bold mb-6 text-[#2F4858]">Groups</h1>
            <div className="flex z-50 flex-wrap">
                {groups.map(group => (
                    <div key={group.id} className="border-2 relative border-[#69A1CB] backdrop-blur-lg bg-white/50 rounded-lg m-2 w-64 shadow-sm">
                        <div className='p-4'>
                            <h3 className="text-xl text-[#2F4858] font-semibold">{group.title}</h3>
                            <p className=" text-[#2F4858]">Number of students: {group.students.length}</p>
                        </div>
                        <div className='absolute top-1 right-2'>${group.group_cost}</div>
                    </div>
                ))}
            </div>
            <img
                src={decoration}
                alt="Decorative SVG"
                className="absolute bottom-5 right-5 z-0"
                style={{ height: '75vh' }}
            />
        </div>
    );
};

export default Home;
