import React, { use, useEffect } from "react";
import Nav from "./Nav";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaChevronCircleRight } from "react-icons/fa";
import { useState } from "react";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";


function UserDashboard() {
 
  const { currentCity, shopInMyCity, itemsInMyCity } = useSelector(
    (state) => state.user,
  );
  const cateScrollRef = React.useRef();
  const shopScrollRef = React.useRef();
  const navigate = useNavigate();
  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList, setUpdatedItemsList]=useState([])

  const handleFilterByCategory = (category) => {
    if(category==="All"){
      setUpdatedItemsList(itemsInMyCity)
    } else{
      const filteredList=itemsInMyCity.filter(i=>i.category===category)
      setUpdatedItemsList(filteredList)
    }
  };

  useEffect(()=>{
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])


  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if (element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(
        element.scrollWidth > element.clientWidth + element.scrollLeft,
      );
    }
  };
  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton,
        );
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
      shopScrollRef.current.addEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          cateScrollRef,
          setShowLeftCateButton,
          setShowRightCateButton,
        );
      });
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(
          shopScrollRef,
          setShowLeftShopButton,
          setShowRightShopButton,
        );
      });
    };
  }, [categories]);
  useEffect(() => {
    const cateElement = cateScrollRef.current;
    const shopElement = shopScrollRef.current;

    const handleCateScroll = () => {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
    };

    const handleShopScroll = () => {
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
    };

    if (cateElement) {
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );
      cateElement.addEventListener("scroll", handleCateScroll);
    }

    if (shopElement) {
      shopElement.addEventListener("scroll", handleShopScroll);
    }

    return () => {
      if (cateElement) {
        cateElement.removeEventListener("scroll", handleCateScroll);
      }
      if (shopElement) {
        shopElement.removeEventListener("scroll", handleShopScroll);
      }
    };
  }, [categories]);

  return (
    // <div className='w-full min-h-screen flex flex-col items-center px-5 py-8'>
    //   <h1 className='text-2xl font-bold'>User Dashboard</h1>
    // </div>
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />
      {/* category section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          {" "}
          Inspiration for your first order
        </h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 "
              onClick={() => scrollHandler(cateScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 "
              onClick={() => scrollHandler(cateScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* Shop section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best Shop in {currentCity}
        </h1>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 "
              onClick={() => scrollHandler(shopScrollRef, "left")}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10 "
              onClick={() => scrollHandler(shopScrollRef, "right")}
            >
              <FaChevronCircleRight />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Items section */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Suggested Food Items
        </h1>
        <div className="w-full h-auto flex flex-wrap gap-5 justify-center ">
          {updatedItemsList?.map((item, index) => (
            <FoodCard key={index} data={item}  />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
