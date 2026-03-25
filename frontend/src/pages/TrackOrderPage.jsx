import axios from "axios";
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";

function TrackOrderPage() {
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState();
  const navigate = useNavigate();
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true },
      );
      setCurrentOrder(result.data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div
        className="relative flex items-center gap-4 top-5 left-5 z-10 mb-2.5"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
        <h1 className="text-2xl font-bold md:text-center">Track Order</h1>
      </div>
      {/* Current Orders will be shown here */}
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          className="bg-white p-4 rounded-2xl shadow-md border border-orange-100"
          key={index}
        >
          <div>
            <p className="text-lg font-bold mb-2 text-[#ff4d2d]">
              {shopOrder.shopName}
            </p>
            <p className="font-semibold">
              <span>Items:</span>{" "}
              {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
            </p>
            <p>
              <span className="font-semibold">Subtotal:</span> ₹
              {shopOrder.subtotal}
            </p>
            <p className="mt-6">
              <span className="font-semibold">Delivery Address:</span>{" "}
              {currentOrder?.deliveryAddress?.text}
            </p>
          </div>
          {/* Details about delivery */}
          {shopOrder.status != "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    <span className="">Delivery Boy Name:</span>
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    <span className="">Delivery Boy Contact No.:</span>
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-semibold">No delivery boy assigned yet.</p>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-lg">Delivered</p>
          )}
          {/* Map will be shown here */}
          {(shopOrder.assignedDeliveryBoy && shopOrder.status!="delivered") &&
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
              <DeliveryBoyTracking
                data={{
                  deliveryBoyLocation: {
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                  },
                  deliveryAddress: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude,
                  },
                }}
              />
            </div>
          }
        </div>
      ))}
    </div>
  );
}

export default TrackOrderPage;
