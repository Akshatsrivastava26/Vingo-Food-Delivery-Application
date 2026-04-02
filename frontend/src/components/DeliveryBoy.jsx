import React, { use } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking"; 
import { BarChart, CartesianGrid, ResponsiveContainer } from "recharts";
import { ClipLoader } from "react-spinners";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState(null);
  const [otp, setOtp] = useState("")
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if(!socket || !userData.role=="deliveryBoy") return
    let watchId;
    if(navigator.geolocation){
      watchId = navigator.geolocation.watchPosition((position)=>{
        const latitude=position.coords.latitude;
        const longitude=position.coords.longitude;
        setDeliveryBoyLocation({lat:latitude,lon:longitude});
        socket.emit("updateLocation",{
          latitude,
          longitude,
          userId:userData._id,
        })
      }),
      (error)=>{
        console.log(error)
      },
      {
        enableHighAccuracy:true,
      }
    }
    return ()=>{
      if(watchId)navigator.geolocation.clearWatch(watchId);
    }
  }, []);

    const ratePerDelivery=50;
    const totalEarnings=todayDeliveries.reduce((sum, d)=>sum+d.count*ratePerDelivery,0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignment`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data?.assignments || []);
    } catch (error) {
      console.log("GET ASSIGNMENT ERROR:", error);
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        { withCredentials: true },
      );
      setCurrentOrder(result.data || null);
      console.log("GET CURRENT ORDER RESULT:", result.data);
    } catch (error) {
      console.log("GET CURRENT ORDER ERROR:", error);
      setCurrentOrder(null);
    }
  };


  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        { withCredentials: true },
      );
      console.log(result.data);
      await getCurrentOrder();
    } catch (error) {
      console.log("ACCEPT ORDER ERROR:", error);
    }
  };

  const sendOtp = async () => {
    setLoading(true); 
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,{
           orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id },
        { withCredentials: true },
      );
      setLoading(false);
      setShowOtpBox(true);
      console.log(result.data);
    } catch (error) {
      console.log("SEND OTP ERROR:", error);
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        { orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id, otp },
        { withCredentials: true },
      );
      console.log(result.data);
      setMessage(result.data.message);
      location.reload();
    } catch (error) {
      console.log("VERIFY OTP ERROR:", error);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/get-today-deliveries`,
        { withCredentials: true },
      );
      console.log(result.data);
      setTodayDeliveries(result.data);
    } catch (error) {
      console.log("VERIFY OTP ERROR:", error);
    }
  };

  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if(data.sentTo == userData._id){
        setAvailableAssignments((prev) => [...prev, data]);

      }
    });
    return () => {
      socket?.off("newAssignment");
    }

  },[socket])
  

  useEffect(() => {
    if (!userData) return;
 
    (async () => {
      await getAssignments();
      await getCurrentOrder();
      await handleTodayDeliveries();
    })();
  }, [userData]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      {/* small devices mai full rahe aur large devices mai beach mai rahe */}
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullName}!
          </h1>
          <p className="text-[#ff4d2d]">
            <span className="font-semibold">Latitude:</span>{" "}
            {deliveryBoyLocation?.lat},{" "}
            <span className="font-semibold">Longitude:</span>{" "}
            {deliveryBoyLocation?.lon}
          </p>
        </div>

        {/* today deliveries will be shown here */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
          <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">Today's Deliveries</h1>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={todayDeliveries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis allowDataOverflow={false} />
              <Tooltip  formatter={(value) => [value, "orders"]} labelFormatter={(label) => `${label}:00`} />
                <Bar dataKey="count" fill="#ff4d2d" />
            </BarChart>
          </ResponsiveContainer>

          <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
            <h1 className="text-xl font-semibold text-gray-800 mb-2">Today's Earnings:</h1>
            <span className="text-3xl font-bold text-green-600 ">₹{totalEarnings}</span>
          </div>
        </div>





        {/* available orders jo brodcast hue hain unko dikhana hai */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
              📦Available Orders
            </h1>
            <div className="space-y-4">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border rounded-lg p-4 flex justify-between items-center"
                    key={index}
                  >
                    {/* from which shop order is arrived */}
                    <div>
                      <p className="text-sm font-semibold">{a?.shopName}</p>
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a?.deliveryAddress.text}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a?.items?.length || 0} items | ₹{a?.subtotal || 0}
                      </p>
                    </div>
                    {/* button for delivery boy to accept the order */}
                    <button
                      className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600 cursor-pointer"
                      onClick={() => acceptOrder(a.assignmentId)}
                    >
                      Accept
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No available orders.</p>
              )}
            </div>
          </div>
        )}

        {/* current order details */}
        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder?.deliveryAddress?.text}
              </p>
              <p className="text-xs text-gray-400 ">
                {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items | ₹
                {currentOrder?.shopOrder?.subtotal || 0}
              </p>
            </div>
            {/* order tracking component */}
            <DeliveryBoyTracking data={{
              deliveryBoyLocation:deliveryBoyLocation ||{  
                    lat: userData.assignedDeliveryBoy.location.coordinates[1],
                    lon: userData.assignedDeliveryBoy.location.coordinates[0],
                  },
                  customerLocation: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude,
            }}} />
            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={sendOtp} disabled={loading}
              >
                {loading?<ClipLoader size={20} color="white"/>: "Mark As Delivered"}
              </button>
            ) : (
              <div className="t-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter OTP send to
                  <span className="text-orange-500">
                    {currentOrder?.user?.fullName}
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  onChange={(e)=>setOtp(e.target.value)}
                  value={otp}
                />
                {message && <p className="text-center text-green-400 text-2xl mb-4">{message}</p> }
                <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all" onClick={verifyOtp}>
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy
