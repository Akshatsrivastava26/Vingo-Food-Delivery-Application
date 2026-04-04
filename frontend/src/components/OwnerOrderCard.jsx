import axios from "axios";
import React from "react";
import { MdPhone } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import { useState } from "react";

function OwnerOrderCard({ data }) {
  const [availableBoys, setAvailableBoys] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(
    data?.shopOrders?.status || "",
  );
  const dispatch = useDispatch();
  const displayTotal = Math.max(
    0,
    Number(data?.shopOrders?.subtotal ?? data?.totalAmount ?? 0),
  );

  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!status) {
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(result.data?.availableBoys || []);

      console.log(result.data);
      // update the status in UI
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* information about user */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.fullName}
        </h2>
        <p className="text-sm">{data.user.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone /> <span> {data?.user?.mobileNumber}</span>
        </p>
        {data.paymentMethod == "online" ? (
          <p className="gap-2 text-sm text-gray-600">
            payment: {data.payment ? "Paid" : "Not Paid"}
          </p>
        ) : (
          <p className="gap-2 text-sm text-gray-600">
            Payment Method: {data?.paymentMethod}
          </p>
        )}
      </div>
      {/* delivery address of user */}
      <div className="flex items-start flex-col gap-2 text-gray-600 text-sm">
        <p>{data?.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude}, Lon:{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>
      {/* mapping shop orders here */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data.shopOrders.shopOrderItems?.map((item, index) => (
          <div
            key={index}
            className="shrink-0 w-40 border rounded-lg p-2 bg-white"
          >
            {item?.item?.image ? (
              <img
                src={item.item.image}
                alt={item.name}
                className="w-full h-24 object-cover rounded"
              />
            ) : (
              <div className="w-full h-24 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                Image not available
              </div>
            )}
            <p className="text-sm font-semibold mt-1">
              {item?.name || item?.item?.name || "Item"}
            </p>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity} x ₹{item.price}{" "}
            </p>
          </div>
        ))}
      </div>
      {/* status update option for owner */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          status:
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {data.shopOrders.status}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <select
            className="rouned-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d] cursor-pointer"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out for delivery">Out for Delivery</option>
          </select>
          <button
            className="px-3 py-1 text-sm rounded-md bg-[#ff4d2d] text-white cursor-pointer disabled:opacity-60"
            disabled={
              !selectedStatus || selectedStatus === data?.shopOrders?.status
            }
            onClick={() =>
              handleUpdateStatus(
                data._id,
                data.shopOrders.shop._id,
                selectedStatus,
              )
            }
          >
            Confirm
          </button>
        </div>
      </div>
      {/* when status is out for delivery then show assigned delivery boy details and also show available delivery */}
      {data.shopOrders.status == "out for delivery" && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? (
            <p>Assigned Delivery Boy:</p>
          ) : (
            <p>Available Delivery Boys:</p>
          )}
          {availableBoys.length > 0 ? (
            availableBoys.map((b, index) => (
              <div className="text-gray-700" key={b?.id || index}>
                {b.fullname}-{b.mobile}
              </div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? (
            <div className="text-gray-700">
              {data.shopOrders.assignedDeliveryBoy.fullName}-
              {data.shopOrders.assignedDeliveryBoy.mobile}
            </div>
          ) : (
            <div>Waiting for available delivery boys...</div>
          )}
        </div>
      )}
      {/* Grant Total */}
      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹{displayTotal}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
