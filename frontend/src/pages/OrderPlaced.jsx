import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

function OrderPlaced() {
    const navigate = useNavigate();
  return (
    <div className='min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
        <FaCircleCheck className='text-green-500 text-6xl mb-4'/>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed Successfully!</h1>
        <p className='text-gray-600 max-w-md mb-6'>Thank you for your purchase. Your order is being prepared.
            You can track your oder status in the "My Orders" section. We appreciate your business and hope you enjoy your meal! 🍽️
        </p>
        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg font-medium transition cursor-pointer' onClick={() => navigate("/my-orders")}>
            Back to My orders
        </button>
      
    </div>
  )
}

export default OrderPlaced
