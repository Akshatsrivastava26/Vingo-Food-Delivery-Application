import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config/env";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClipLoader } from "react-spinners";
import { logger } from "../utils/logger";
import BrandButton from "./ui/BrandButton";
import { FaMotorcycle, FaRupeeSign } from "react-icons/fa";
import { MdOutlineAssignmentTurnedIn } from "react-icons/md";

function DeliveryBoy() {
  const { userData, socket } = useSelector((state) => state.user);
  const currentUser = userData?.user || userData;

  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveriesStats, setTodayDeliveriesStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [assignmentMessage, setAssignmentMessage] = useState("");

  const ratePerDelivery = 50;
  const totalEarnings = todayDeliveriesStats.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0,
  );
  const currentHourDeliveries =
    todayDeliveriesStats?.[todayDeliveriesStats.length - 1]?.count || 0;
  const firstName = currentUser?.fullName?.split(" ")?.[0] || "Partner";

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignment`, {
        withCredentials: true,
      });
      setAvailableAssignments(result.data?.assignments || []);
    } catch (error) {
      logger.error("GET ASSIGNMENT ERROR", error);
      setAssignmentMessage("Unable to fetch assignments right now");
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-current-order`,
        {
          withCredentials: true,
        },
      );
      setCurrentOrder(result.data || null);
    } catch (error) {
      setCurrentOrder(null);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-today-deliveries`,
        {
          withCredentials: true,
        },
      );
      setTodayDeliveriesStats(result.data?.stats || []);
    } catch (error) {
      logger.error("TODAY DELIVERIES ERROR", error);
    }
  };

  const acceptOrder = async (assignmentId) => {
    setAssignmentMessage("");
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/accept-order/${assignmentId}`,
        {
          withCredentials: true,
        },
      );
      setAssignmentMessage(
        result.data?.message || "Order accepted successfully",
      );
      await getCurrentOrder();
      await getAssignments();
    } catch (error) {
      setAssignmentMessage(
        error?.response?.data?.message || "Could not accept order",
      );
      await getCurrentOrder();
      await getAssignments();
    }
  };

  const sendOtp = async () => {
    if (!currentOrder?._id || !currentOrder?.shopOrder?._id) return;

    setLoading(true);
    try {
      await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
        },
        { withCredentials: true },
      );
      setShowOtpBox(true);
    } catch (error) {
      logger.error("SEND OTP ERROR", error);
      setMessage(error?.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!currentOrder?._id || !currentOrder?.shopOrder?._id) return;

    setMessage("");
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: currentOrder.shopOrder._id,
          otp,
        },
        { withCredentials: true },
      );
      setMessage(result.data?.message || "OTP verified");
      setShowOtpBox(false);
      setOtp("");
      await getCurrentOrder();
      await handleTodayDeliveries();
    } catch (error) {
      logger.error("VERIFY OTP ERROR", error);
      setMessage(error?.response?.data?.message || "OTP verification failed");
    }
  };

  useEffect(() => {
    if (!socket || currentUser?.role !== "deliveryBoy") return;

    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          setDeliveryBoyLocation({ lat: latitude, lon: longitude });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: currentUser?._id,
          });
        },
        (error) => {
          logger.warn("Location watch error", error);
        },
        {
          enableHighAccuracy: true,
        },
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [socket, currentUser?._id, currentUser?.role]);

  useEffect(() => {
    if (!socket || !currentUser?._id) return;

    const handleNewAssignment = (data) => {
      if (String(data?.sentTo) === String(currentUser._id)) {
        setAvailableAssignments((prev) => [...prev, data]);
      }
    };

    socket.on("newAssignment", handleNewAssignment);
    return () => {
      socket.off("newAssignment", handleNewAssignment);
    };
  }, [socket, currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return;

    (async () => {
      await getAssignments();
      await getCurrentOrder();
      await handleTodayDeliveries();
    })();
  }, [currentUser?._id]);

  return (
    <div className="w-full min-h-[calc(100vh-9rem)] animate-app-fade px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        <section className="section-card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="soft-badge mb-2">
                <FaMotorcycle /> Delivery Console
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold brand-gradient-text">
                Welcome, {firstName}
              </h1>
              <p className="text-(--text-muted) mt-1">
                Stay live, accept assignments quickly, and close deliveries with
                OTP.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-soft) bg-(--bg-subtle) px-4 py-3 text-sm text-(--text-secondary)">
              <p>
                <span className="font-semibold">Lat:</span>{" "}
                {typeof deliveryBoyLocation?.lat === "number"
                  ? deliveryBoyLocation.lat.toFixed(6)
                  : "-"}
              </p>
              <p>
                <span className="font-semibold">Lon:</span>{" "}
                {typeof deliveryBoyLocation?.lon === "number"
                  ? deliveryBoyLocation.lon.toFixed(6)
                  : "-"}
              </p>
            </div>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-(--text-primary)">
              Today's Deliveries
            </h2>
            <span className="soft-badge">
              <MdOutlineAssignmentTurnedIn /> Last slot: {currentHourDeliveries}
            </span>
          </div>

          <div className="rounded-lg border border-(--border-soft) bg-(--bg-elevated) px-2 py-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={todayDeliveriesStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f2d6cb" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                <YAxis allowDataOverflow={false} />
                <Tooltip
                  formatter={(value) => [value, "orders"]}
                  labelFormatter={(label) => `${label}:00`}
                />
                <Bar dataKey="count" fill="#ff2d55" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 max-w-sm rounded-lg border border-(--border-soft) bg-(--bg-subtle) p-5 text-center mx-auto">
            <p className="text-sm text-(--text-muted) mb-1">Today's Earnings</p>
            <p className="text-3xl font-extrabold text-emerald-600 inline-flex items-center gap-1">
              <FaRupeeSign className="text-emerald-600" /> {totalEarnings}
            </p>
          </div>
        </section>

        {!currentOrder && (
          <section className="section-card p-5 sm:p-6">
            <h2 className="text-xl font-bold mb-4 text-(--text-primary)">
              Available Orders
            </h2>
            {assignmentMessage && (
              <p className="text-sm text-(--brand-2) mb-3">
                {assignmentMessage}
              </p>
            )}
            <div className="space-y-3">
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div
                    className="border border-(--border-soft) rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-(--bg-elevated)"
                    key={a?.assignmentId || index}
                  >
                    <div>
                      <p className="text-sm font-semibold text-(--text-primary)">
                        {a?.shopName || "Shop"}
                      </p>
                      <p className="text-sm text-(--text-muted)">
                        <span className="font-semibold">Delivery Address:</span>{" "}
                        {a?.deliveryAddress?.text || "No address"}
                      </p>
                      <p className="text-xs text-(--text-subtle)">
                        {a?.items?.length || 0} items | ₹{a?.subtotal || 0}
                      </p>
                    </div>
                    <BrandButton onClick={() => acceptOrder(a.assignmentId)}>
                      Accept
                    </BrandButton>
                  </div>
                ))
              ) : (
                <p className="text-(--text-subtle) text-sm">
                  No available orders.
                </p>
              )}
            </div>
          </section>
        )}

        {currentOrder && (
          <section className="section-card p-5 sm:p-6">
            <h2 className="text-xl font-bold mb-3 text-(--text-primary)">
              Current Order
            </h2>
            <div className="border border-(--border-soft) rounded-lg p-4 mb-3 bg-(--bg-elevated)">
              <p className="font-semibold text-sm text-(--text-primary)">
                {currentOrder?.shopOrder?.shop?.name || "Shop"}
              </p>
              <p className="text-sm text-(--text-muted)">
                {currentOrder?.deliveryAddress?.text || "Address unavailable"}
              </p>
              <p className="text-xs text-(--text-subtle)">
                {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items | ₹
                {currentOrder?.shopOrder?.subtotal || 0}
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation ||
                  currentOrder?.deliveryBoyLocation || { lat: null, lon: null },
                customerLocation: {
                  lat: currentOrder?.deliveryAddress?.latitude,
                  lon: currentOrder?.deliveryAddress?.longitude,
                },
              }}
            />

            {!showOtpBox ? (
              <BrandButton
                className="mt-4 w-full py-3 text-base"
                onClick={sendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader size={20} color="white" />
                ) : (
                  "Mark As Delivered"
                )}
              </BrandButton>
            ) : (
              <div className="mt-4 p-4 border border-(--border-soft) rounded-lg bg-(--bg-subtle)">
                <p className="text-sm font-semibold mb-2 text-(--text-secondary)">
                  Enter OTP sent to{" "}
                  <span className="text-(--brand-2)">
                    {currentOrder?.user?.fullName || "customer"}
                  </span>
                </p>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border border-(--border-soft) px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-(--brand-2)/30 bg-white"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                />
                {message && (
                  <p className="text-center text-sm mb-4 text-(--brand-2)">
                    {message}
                  </p>
                )}
                <BrandButton className="w-full" onClick={verifyOtp}>
                  Submit OTP
                </BrandButton>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default DeliveryBoy;
