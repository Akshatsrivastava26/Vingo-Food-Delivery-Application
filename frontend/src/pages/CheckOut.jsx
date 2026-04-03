import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { setAddress, setLocation } from "../redux/mapSlice";
import { useState } from "react";
import { useEffect } from "react";
import { serverUrl } from "../App";
import { addMyOrder } from "../redux/userSlice";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    const hasValidLocation =
      typeof location?.lat === "number" && typeof location?.lon === "number";

    if (hasValidLocation) {
      map.setView([location.lat, location.lon], 16, { animate: true });
    }
  }, [location, map]);

  return null;
}

function CheckOut() {
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount, userData } = useSelector(
    (state) => state.user,
  );
  const currentUser = userData?.user || userData;
  const backendLat = currentUser?.location?.coordinates?.[1];
  const backendLon = currentUser?.location?.coordinates?.[0];
  const hasValidLocation =
    typeof location?.lat === "number" && typeof location?.lon === "number";
  const mapCenter = hasValidLocation
    ? [location.lat, location.lon]
    : [28.6139, 77.209];
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEO_API_KEY;
  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    getAddressByLatLng(lat, lng);
  };

  const getAddressByLatLng = async (lat, lon) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`,
      );
      dispatch(
        setAddress(
          result?.data?.results[0].formatted ||
            result?.data?.results[0].address_line1 ||
            result?.data?.results[0].address_line2,
        ),
      );
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };
  const getCurrentLocation = () => {
    if (typeof backendLat !== "number" || typeof backendLon !== "number") {
      alert("Current location is not available yet");
      return;
    }

    dispatch(setLocation({ lat: backendLat, lon: backendLon }));
    getAddressByLatLng(backendLat, backendLon);
  };
  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`,
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.error("Error fetching lat/lng:", error);
    }
  };

  const handlePlaceOrder = async () => {
    // safety check
    if (!location?.lat || !location?.lon) {
      alert("Please select delivery location");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      console.log("ORDER DATA:", {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon,
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems,
      });

      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount: AmountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true },
      );
      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data?.order)); // Update Redux store with the new order
        navigate("/order-placed"); // optional redirect
      } else {
        const orderId = result.data?.orderId;
        const razorOrder = result.data?.razorOrder;
        openRazorpayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.error("ORDER ERROR:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while placing order",
      );
    }
  };

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Vingo Ltd.",
      description: "Payment for order",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(result.data?.order)); // Update Redux store with the new order
          navigate("/order-placed");
        } catch (error) {
          console.error(
            "Payment verification failed:",
            error.response?.data || error,
          );
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  useEffect(() => {
    if (
      !hasValidLocation &&
      typeof backendLat === "number" &&
      typeof backendLon === "number"
    ) {
      dispatch(setLocation({ lat: backendLat, lon: backendLon }));
      getAddressByLatLng(backendLat, backendLon);
    }
  }, [hasValidLocation, backendLat, backendLon, dispatch]);

  return (
    <div className="min-h-screen bg-[#fff9f6] flex item-center justify-center p-6">
      <div
        className="absolute top-5 left-5 z-10 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        {/* Map Location Section */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <IoLocationSharp className="text-[#ff4d2d]" />
            Delivery Location
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              placeholder="Enter Your Delivery Address..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getLatLngByAddress}
            >
              <IoSearchOutline size={17} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={getCurrentLocation}
            >
              <TbCurrentLocation size={17} />
            </button>
          </div>
          {/* Map showing current location */}
          <div className="rounded-xl border overflow-hidden ">
            <div className="h-64 w-full flex item-center justify-center">
              <MapContainer
                className={"w-full h-full"}
                center={mapCenter}
                zoom={17}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hasValidLocation && <RecenterMap location={location} />}
                {hasValidLocation && (
                  <Marker
                    position={[location.lat, location.lon]}
                    draggable
                    eventHandlers={{ dragend: onDragEnd }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </section>
        {/* Payment Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash on Delivery (COD) Method */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"} cursor-pointer`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  Cash on Delivery (COD)
                </p>
                <p className="text-xs text-gray-500">
                  Pay when you receive your delivery.
                </p>
              </div>
            </div>
            {/* Online Payment Method */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"} cursor-pointer`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton className="text-purple-700 text-lg" />
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <FaCreditCard className="text-blue-700 text-lg" />
              </span>
              <div>
                <p className="font-medium text-gray-800">
                  UPI / Credit / Debit Card
                </p>
                <p className="text-xs text-gray-500">
                  Pay securely using your preferred method.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*Place Order Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Order Summary
          </h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 gap-y-2" />
            <div className="flex justify-between font-medium text-gray-800">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee == 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#ff4d2d] pt-2">
              <span>Total</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>
        {/* Place Order Button */}
        <section className="mt-4">
          <button
            className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer"
            onClick={handlePlaceOrder}
          >
            {paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default CheckOut;
