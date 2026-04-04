import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";

function UserOrderCard({ data }) {
  const navigate = useNavigate();

  const [selectedRating, setSelectedRating] = useState({}); //itemId:rating
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true },
      );
      setSelectedRating((prev) => ({ ...prev, [itemId]: rating }));
    } catch (error) {
      console.log("RATING ERROR:", error);
    }
  };
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b-pb-2">
        {/* left side data */}
        <div>
          <p className="font font-semibold">Order #{data._id.slice(-6)}</p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        {/* right side data */}
        <div className="text-right">
          {data.paymentMethod == "cod" ? (
            <p className="text-sm text-gray-500">
              {data.paymentMethod?.toUpperCase()}
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-semibold">
              Payment: {data.payment ? "Paid" : "Not Paid"}
            </p>
          )}

          <p className="font-medium text-blue-600">
            {data.shopOrders?.[0].status}
          </p>
        </div>
      </div>
      {/* mapping shop orders here */}
      {data.shopOrders?.map((shopOrder, index) => (
        <div className="border rounded-lg p-4" key={index}>
          <p>{shopOrder.shop.name}</p>
          {/* items will be shown here */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {shopOrder.shopOrderItems?.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 border rounded-lg p-2 bg-white"
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

                {/* rating of items */}
                {shopOrder.status == "delivered" && item?.item?._id && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        className={`${selectedRating[item.item._id] >= star ? "text-yellow-400" : "text-gray-400"}`}
                        onClick={() => handleRating(item.item._id, star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* left side price & right side status */}
          <div className="flex justify-between items-center border-t pt-2">
            <p className="font-semibold">Subtotal: ₹{shopOrder.subtotal}</p>
            <span className="text-sm font-medium text-blue-600">
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      {/* Grant Total */}
      <div className="flex justify-between items-center border-t pt-2">
        <p className="font-semibold">Total: ₹{data.totalAmount}</p>
        {/* Track Order Button */}
        <button
          className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;
