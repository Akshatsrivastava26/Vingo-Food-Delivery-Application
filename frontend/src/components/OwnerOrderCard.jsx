import axios from 'axios';
import React from 'react'
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';

function OwnerOrderCard({data}) {
  const [availableBoys, setAvailableBoys]=useState([]);
  const dispatch=useDispatch();
  const handleUpdateStatus=async(orderId, shopId, status)=>{
    try {
      const result=await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true});
      dispatch(updateOrderStatus({orderId, shopId, status}));
      setAvailableBoys(result.data.availableBoys); 

      console.log(result.data);
      // update the status in UI
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      {/* information about user */}
      <div>
        <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullname}</h2>
        <p className='text-sm'>{data.user.email}</p>
        <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'><MdPhone /> <span> {data.user.mobile}</span></p>
      </div>
      {/* delivery address of user */}
      <div className='flex items-start flex-col gap-2 text-gray-600 text-sm'>
        <p>{data?.deliveryAddress?.text}</p>
        <p className='text-xs text-gray-500'>Lat: {data?.deliveryAddress?.latitude}, Lon: {data?.deliveryAddress?.longitude}</p>
      </div>
      {/* mapping shop orders here */}
      <div className='flex space-x-4 overflow-x-auto pb-2'> 
            {data.shopOrders.shopOrderItems?.map((item, index) => (
              <div key={index}className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                <img src={item.item.image} alt={item.name}  className='w-full h-24 object-cover rounded'/>
                <p className='text-sm font-semibold mt-1'>{item.name}</p>
                <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price} </p>
              </div>
            ))}
      </div>
      {/* status update option for owner */}
      <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
        <span className='text-sm'>status:<span className='font-semibold capitalize text-[#ff4d2d]'>{data.shopOrders.status}</span></span>
        <select className='rouned-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]' onChange={(e)=>handleUpdateStatus(data._id,data.shopOrders.shop._id,e.target.value)}>
            <option value="">Select Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="out for delivery">Out for Delivery</option>
        </select>
      </div>
      {/* when status is out for delivery then show assigned delivery boy details and also show available delivery */}
      {data.shopOrders.status == "out for delivery" && 
       <div className='mt-3 p-2 border rounded-lg text-sm bg-orange-50'>
        <p>Available Delivery Boys:</p>
        {availableBoys.length > 0 ? (
          availableBoys.map((b, index)=>(
            <div className='text-gray-300'>{b.fullname}-{b.mobile}</div>
          ))
        ): <div>Waiting for available delivery boys...</div>}

       </div>
      }
      {/* Grant Total */}
      <div className='text-right font-bold text-gray-800 text-sm'>
        Total: ₹{data.shopOrders.subTotal}
      </div>
    </div>
  )
}

export default OwnerOrderCard
