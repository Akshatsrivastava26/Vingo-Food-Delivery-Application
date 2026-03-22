import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice.js";

function useGetItemsByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);

  useEffect(() => {
    // Only fetch if city is valid
    if (!currentCity || currentCity === "null" || currentCity === "undefined") {
      return;
    }

    const fetchItems = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-city/${currentCity}`,
          { withCredentials: true },
        );
        dispatch(setItemsInMyCity(result.data));
        console.log(result.data);
      } catch (error) {
        console.log("Error in fetching items", error);
      }
    };
    fetchItems();
  }, [currentCity, dispatch]);
}

export default useGetItemsByCity;
