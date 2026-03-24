import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { useEffect } from "react";
import { useState } from "react";
import DeliveryBoyTracking from "./DeliveryBoyTracking";

function DeliveryBoy() {
  const { userData } = useSelector((state) => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState(null);
  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data);
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
      setCurrentOrder(result.data);
      console.log("GET CURRENT ORDER RESULT:", result.data);
    } catch (error) {
      console.log("GET CURRENT ORDER ERROR:", error);
    }
  };

  const handelSendOtp = () => {
    setShowOtpBox(true);
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

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
  }, [userData]);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
      {/* small devices mai full rahe aur large devices mai beach mai rahe */}
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData?.fullName}!
          </h1>
          <p className="text-[#ff4d2d]">
            <span className="font-semibold">Latitude:</span>{" "}
            {userData?.location.coordinates[1]},{" "}
            <span className="font-semibold">Longitude:</span>{" "}
            {userData?.location.coordinates[0]}
          </p>
        </div>

        {/* available orders jo brodcast hue hain unko dikhana hai */}
        {!currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
              Available Orders
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
                        {a.items.length} items | ₹{a.subtotal}
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

        {/* curren t order details */}
        {currentOrder && (
          <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
            <h2 className="text-lg font-bold mb-3">📦Current Order</h2>
            <div className="border rounded-lg p-4 mb-3">
              <p className="font-semibold text-sm">
                {currentOrder?.shopOrder.shop.name}
              </p>
              <p className="text-sm text-gray-500">
                {currentOrder?.deliveryAddress}
              </p>
              <p className="text-xs text-gray-400 ">
                {currentOrder.shopOrder.shopOrderItems.length} items | ₹
                {currentOrder.shopOrder.subtotal}
              </p>
            </div>
            {/* order tracking component */}
            <DeliveryBoyTracking data={currentOrder} />
            {!showOtpBox ? (
              <button
                className="mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200"
                onClick={handelSendOtp}
              >
                Mark As Delivered
              </button>
            ) : (
              <div className="t-4 p-4 border rounded-xl bg-gray-50">
                <p className="text-sm font-semibold mb-2">
                  Enter OTP send to{" "}
                  <span className="text-orange-500">
                    {currentOrder.cuser.fullName}
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all">
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

export default DeliveryBoy;
