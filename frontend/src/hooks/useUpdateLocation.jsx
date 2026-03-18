import React, { use } from 'react'
import { useEffect } from 'react'
import axios from 'axios';
import { serverUrl } from '../App.jsx';
import { useDispatch } from 'react-redux';
import {setCurrentAddress, setUserData} from '../redux/userSlice.js';
import { useSelector } from 'react-redux';
import { setCurrentCity,setCurrentState } from '../redux/userSlice.js';
import { setAddress, setLocation } from '../redux/mapSlice.js';


function useUpdateLocation() {
    const dispatch=useDispatch();
    const {userData}=useSelector((state)=>state.user);
    useEffect(() => {
        const UpdateLocation=async (lat,lon)=>{
            const result=await axios.post(`${serverUrl}/api/user/update-location`,{lat,lon},{withCredentials:true})
            console.log(result.data);
        }
        navigator.geolocation.watchPosition((pos)=>{
            UpdateLocation(pos.coords.latitude,pos.coords.longitude);
        })
    }, [userData]);
}

export default useUpdateLocation
