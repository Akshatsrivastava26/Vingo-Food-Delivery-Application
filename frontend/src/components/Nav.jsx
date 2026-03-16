import React from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import axios from "axios";
import { setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";






function Nav() {
  const { userData, currentCity, cartItems } = useSelector((state) => state.user) || {};
  const user = userData?.user;
  const { myShopData } = useSelector((state) => state.owner) || {};
  const [showInfo, setShowInfo] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="w-full h-20 flex items-center justify-between md:justify-center gap-8 px-5 fixed top-0 z-50 bg-[#fff9f6] overflow-visible">
      {showSearch && user?.role == "user" && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-5 flex fixed top-20 left-[5%] md:hidden">
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>
          <div className="w-[80%] flex items-center gap-2.5">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search delicious food..."
              className="px-2.5 text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold m-2 text-[#ff4d2d] whitespace-nowrap">Vingo</h1>
      {user?.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-5 hidden md:flex">
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot size={25} className="text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">{currentCity}</div>
          </div>
          <div className="w-[80%] flex items-center gap-2.5">
            <IoIosSearch size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search delicious food..."
              className="px-2.5 text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 min-w-[120px]">
        {user?.role == "user" &&
          (showSearch ? (
            <RxCross2
              size={25}
              className="text-[#ff4d2d] md:hidden"
              onClick={() => setShowSearch(false)}
            />
          ) : (
            <IoIosSearch
              size={25}
              className="text-[#ff4d2d] md:hidden"
              onClick={() => setShowSearch(true)}
            />
          ))}

        {user?.role == "owner" ? <>
        {myShopData && <>
        <button className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]" onClick={()=> navigate("/add-item")}>
            <FaPlus size={20}/>
            <span>Add Food Item</span>
          </button>
          
          <button className="md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d]" onClick={()=> navigate("/add-item")}>
            <FaPlus size={20}/ >
          </button>
          </>}
        
          
          <div className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium"onClick={()=>navigate("/my-orders")} >
            <TbReceipt2 size={20}/>
            <span>My Orders</span>
            <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px">0</span>
          </div>
          <div className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium cursor-pointer" onClick={()=>navigate("/my-orders")}>
            <TbReceipt2 size={20}/>
            <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px">0</span>
          </div>
        </>: (<>

        {/* Cart Icon */}
        <div className="relative cursor-pointer" onClick={()=>navigate("/cart")}>
            <FiShoppingCart size={25} className="text-[#ff4d2d]" />
            <span className="absolute right-[-9px] -top-3 text-[#ff4d2d]">
              {cartItems.length}
            </span>
          </div>
        

        <button className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer" onClick={()=>navigate("/my-orders")}>
          My Orders
        </button>
        
        </>)}

          
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {user?.fullName ? user.fullName.slice(0, 1) : "?"}
        </div>
        {showInfo && (
          <div className="fixed top-20 right-2.5 md:right-[10%] lg:right-[25%] w-[180px] bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 z-50">
            <div className="text-[17px] font-semibold">
              {user?.fullName}
            </div>
            {userData.role == "user" && <div className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer" onClick={()=>navigate("/my-orders")}>
              My Orders
            </div>}
            
            <div
              className="text-[#ff4d2d] font-semibold cursor-pointer"
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nav;
