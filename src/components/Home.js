// src/components/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import decoration from '../assets/search_app_decoration.svg';
import addIcon from '../assets/BigAddButton.svg';
import '../scrollbar.css';

const dummyGroups = [
    {
        id: 1,
        title: "Group One",
        group_cost: 800,
        students: [
            { id: 1, name: "Alice", payment_day: 1, status: "Paid", parent_phone_number: "1234567890", cost: 800, paid_amount: 800 },
            { id: 2, name: "Bob", payment_day: 5, status: "Pending", parent_phone_number: "1234567891", cost: 800, paid_amount: 400 },
            { id: 3, name: "Charlie", payment_day: 10, status: "Delayed", parent_phone_number: "1234567892", cost: 800, paid_amount: 200 },
        ]
    },
    {
        id: 2,
        title: "Group Two",
        group_cost: 700,
        students: [
            { id: 4, name: "David", payment_day: 15, status: "Paid", parent_phone_number: "1234567893", cost: 700, paid_amount: 700 },
            { id: 5, name: "Eve", payment_day: 20, status: "Pending", parent_phone_number: "1234567894", cost: 700, paid_amount: 350 },
        ]
    },
    {
        id: 3,
        title: "Group Three",
        group_cost: 900,
        students: [
            { id: 6, name: "Frank", payment_day: 25, status: "Paid", parent_phone_number: "1234567895", cost: 900, paid_amount: 900 },
            { id: 7, name: "Grace", payment_day: 30, status: "Pending", parent_phone_number: "1234567896", cost: 900, paid_amount: 450 },
        ]
    },
    {
        id: 4,
        title: "Group Four",
        group_cost: 750,
        students: [
            { id: 8, name: "Heidi", payment_day: 2, status: "Delayed", parent_phone_number: "1234567897", cost: 750, paid_amount: 250 },
            { id: 9, name: "Ivan", payment_day: 8, status: "Paid", parent_phone_number: "1234567898", cost: 750, paid_amount: 750 },
        ]
    },
    {
        id: 5,
        title: "Group Five",
        group_cost: 650,
        students: [
            { id: 10, name: "Judy", payment_day: 12, status: "Pending", parent_phone_number: "1234567899", cost: 650, paid_amount: 325 },
            { id: 11, name: "Mallory", payment_day: 18, status: "Paid", parent_phone_number: "1234567800", cost: 650, paid_amount: 650 },
        ]
    },
    {
        id: 6,
        title: "Group Six",
        group_cost: 500,
        students: [
            { id: 12, name: "Niaj", payment_day: 22, status: "Delayed", parent_phone_number: "1234567801", cost: 500, paid_amount: 100 },
            { id: 13, name: "Olivia", payment_day: 28, status: "Paid", parent_phone_number: "1234567802", cost: 500, paid_amount: 500 },
        ]
    },
    {
        id: 7,
        title: "Group Seven",
        group_cost: 550,
        students: [
            { id: 14, name: "Peggy", payment_day: 7, status: "Pending", parent_phone_number: "1234567803", cost: 550, paid_amount: 275 },
            { id: 15, name: "Quentin", payment_day: 14, status: "Paid", parent_phone_number: "1234567804", cost: 550, paid_amount: 550 },
        ]
    },
    {
        id: 8,
        title: "Group Eight",
        group_cost: 600,
        students: [
            { id: 16, name: "Rupert", payment_day: 21, status: "Delayed", parent_phone_number: "1234567805", cost: 600, paid_amount: 150 },
            { id: 17, name: "Sybil", payment_day: 27, status: "Paid", parent_phone_number: "1234567806", cost: 600, paid_amount: 600 },
        ]
    },
    {
        id: 9,
        title: "Group Nine",
        group_cost: 700,
        students: [
            { id: 18, name: "Trudy", payment_day: 5, status: "Paid", parent_phone_number: "1234567807", cost: 700, paid_amount: 700 },
            { id: 19, name: "Victor", payment_day: 10, status: "Pending", parent_phone_number: "1234567808", cost: 700, paid_amount: 350 },
        ]
    }
];

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
            <div className='flex items-center'>
                <h1 className="text-5xl font-bold mb-6 text-[#2F4858]">Groups</h1>
                <button className='hover:scale-110 transition'>
                    <img
                        src={addIcon}
                        alt="Add Group Icon"
                        className='h-[40px] mb-3 ml-3'
                    />
                </button>
            </div>
            <div className="grid pr-2 grid-cols-4 grid-rows-[auto_auto] overflow-y-auto relative max-h-[50vh] gap-5 z-50">
                {dummyGroups.map(group => (
                    <div key={group.id} className="border-2 relative border-[#69A1CB] backdrop-blur-lg bg-white/50 rounded-lg w-full shadow-sm">
                        <div className='p-4'>
                            <h3 className="text-xl text-[#2F4858] font-semibold">{group.title}</h3>
                            <p className=" text-[#2F4858]">Number of students: {group.students.length}</p>
                        </div>
                        <div className='absolute top-1 right-2 text-[#F26419]'>${group.group_cost}</div>
                        <div className='bg-white text-center font-medium transition-colors delay-75 text-[#2F4858]/75 hover:text-[#2F4858] border-t hover:cursor-pointer hover:bg-[#55DDE0] rounded-b-lg border-[#69A1CB] py-2'>View all details</div>
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
