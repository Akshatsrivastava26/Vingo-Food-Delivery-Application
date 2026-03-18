import React, { use } from 'react'
import { useEffect } from 'react'
import axios from 'axios';
import { serverUrl } from '../App.jsx';
import { useDispatch } from 'react-redux';
import {setCurrentAddress, setUserData} from '../redux/userSlice.js';
import { useSelector } from 'react-redux';
import { setCurrentCity,setCurrentState } from '../redux/userSlice.js';
import { setAddress, setLocation } from '../redux/mapSlice.js';


function useGetCity() {
    const dispatch=useDispatch();
    const {userData}=useSelector((state)=>state.user);
    const apiKey=import.meta.env.VITE_GEO_API_KEY;
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            dispatch(setLocation({ lat: latitude, lon: longitude }));
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`);

            dispatch(setCurrentCity(result?.data?.results[0].city || result?.data?.results[0].county));
            dispatch(setCurrentState(result?.data?.results[0].state));
            dispatch(setCurrentAddress(result?.data?.results[0].address_line1 || result?.data?.results[0].address_line2));
            dispatch(setAddress(result?.data?.results[0].formatted || result?.data?.results[0].address_line1 || result?.data?.results[0].address_line2));
    });
    }, [userData]);
}

export default useGetCity

// import { useEffect, useRef } from 'react';
// import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { setCity } from '../redux/userSlice';

// function useGetCity() {
//   const dispatch = useDispatch();
//   const apiKey = import.meta.env.VITE_GEO_API_KEY;
//   const hasFetched = useRef(false); // 👈 prevents double call

//   useEffect(() => {
//     if (hasFetched.current) return;
//     hasFetched.current = true;

//     if (!navigator.geolocation) {
//       console.error("Geolocation not supported");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const { latitude, longitude } = position.coords;

//           const result = await axios.get(
//             `https://api.geoapify.com/v1/geocode/reverse`,
//             {
//               params: {
//                 lat: latitude,
//                 lon: longitude,
//                 format: "json",
//                 apiKey,
//               },
//             }
//           );

//           dispatch(setCity(result?.data?.results?.[0]?.city || null));
//         } catch (err) {
//           console.error("City fetch failed", err);
//         }
//       },
//       (error) => {
//         console.error("Location permission denied", error);
//       }
//     );
//   }, []);

//   return null; // 👈 custom hook
// }

// export default useGetCity;
