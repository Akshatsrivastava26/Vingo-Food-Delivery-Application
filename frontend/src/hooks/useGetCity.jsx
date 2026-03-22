import React, { use } from "react";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setCurrentAddress, setUserData } from "../redux/userSlice.js";
import { useSelector } from "react-redux";
import { setCurrentCity, setCurrentState } from "../redux/userSlice.js";

function useGetCity() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  const apiKey = import.meta.env.VITE_GEO_API_KEY;

  useEffect(() => {
    if (!userData) return;

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      // Set a default city if geolocation is not available
      dispatch(setCurrentCity("Ghaziabad"));
      dispatch(setCurrentState("Uttar Pradesh"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
          );

          dispatch(
            setCurrentCity(result?.data?.results[0]?.city || "Ghaziabad"),
          );
          dispatch(
            setCurrentState(result?.data?.results[0]?.state || "Uttar Pradesh"),
          );
          dispatch(
            setCurrentAddress(
              result?.data?.results[0]?.address_line1 ||
                result?.data?.results[0]?.address_line2 ||
                "",
            ),
          );
        } catch (error) {
          console.error("Error fetching location:", error);
          // Set default city on error
          dispatch(setCurrentCity("Ghaziabad"));
          dispatch(setCurrentState("Uttar Pradesh"));
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Set default city if user denies location access
        dispatch(setCurrentCity("Ghaziabad"));
        dispatch(setCurrentState("Uttar Pradesh"));
      },
    );
  }, [userData, dispatch, apiKey]);
}

export default useGetCity;

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
