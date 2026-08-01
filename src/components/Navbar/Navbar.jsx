import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useSelector, useDispatch } from "react-redux"
import { AiOutlineShoppingCart } from "react-icons/ai"
import { VscSignOut } from "react-icons/vsc"
import { logout } from "../../services/operations/authAPI"
import { fetchCourseCategories } from "../../services/operations/courseDetailsAPI"

const Navbar = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [categories, setCategories] = useState([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetchCourseCategories();
        if (res && Array.isArray(res)) {
          setCategories(res);
        }
      } catch (err) {
        console.log("Could not fetch categories", err);
      }
    };
    getCategories();
  }, []);

  return (
    <nav className="bg-richblack-900 h-20 flex justify-center items-center sticky top-0 z-[1000] border-b-[1px] border-richblack-700 shadow-[0_8px_30px_rgba(0,0,0,0.1),0_5px_8px_rgba(79,70,229,0.15)] transition-all duration-300">
      <div className="flex justify-between items-center w-11/12 max-w-maxContent">
        {/* Logo Section */}
        <Link to="/" className="no-underline flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white w-10 h-10 flex justify-center items-center rounded-lg text-2xl font-extrabold shadow-[0_4px_10px_rgba(79,70,229,0.4)]">
            S
          </div>
          <span className="text-[1.8rem] font-bold text-white tracking-[-0.5px]">
            Study<span className="text-indigo-400">_Tech</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center gap-14 text-richblack-25">
          <li>
            <Link to="/" className="hover:text-indigo-400 transition-all duration-200">
              Home
            </Link>
          </li>

          <li
            className="relative group cursor-pointer"
            onMouseEnter={() => setIsCatalogOpen(true)}
            onMouseLeave={() => setIsCatalogOpen(false)}
          >
            <Link to="/catalog" className="flex items-center gap-1 hover:text-indigo-400 transition-all duration-200">
              Catalog <span>▾</span>
            </Link>

            {/* Dropdown Menu */}
            <div className={`absolute top-full left-0 mt-2 bg-richblack-800 min-w-[200px] rounded-md shadow-2xl py-2 border border-richblack-700 flex flex-col transition-all duration-300 ${isCatalogOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              {categories.length > 0 ? (
                categories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/catalog/${category.name.split(" ").join("-").toLowerCase()}`}
                    className="px-4 py-2 text-richblack-100 hover:bg-richblack-700 hover:text-indigo-300 transition-all duration-200"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-richblack-400">Loading...</div>
              )}
            </div>
          </li>

          <li>
            <Link to="/about" className="hover:text-indigo-400 transition-all duration-200">
              About
            </Link>
          </li>

          <li>
            <Link to="/contact" className="hover:text-indigo-400 transition-all duration-200">
              Contact
            </Link>
          </li>
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {token === null && (
            <>
              <Link to="/login">
                <button className="rounded-full bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-[0_2px_10px_rgba(79,70,229,0.3)]">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-full bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-all duration-200 shadow-[0_2px_10px_rgba(79,70,229,0.3)]">
                  Signup
                </button>
              </Link>
            </>
          )}

          {token !== null && (
            <div className="flex items-center gap-x-4">
              {user && user?.account_type === "Student" && (
                <Link to="/dashboard/cart" className="relative text-2xl text-richblack-100 hover:text-white transition-colors duration-200">
                  <AiOutlineShoppingCart />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-indigo-600 text-center text-xs font-bold text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/dashboard/my-profile">
                <img
                  src={user?.image}
                  alt={user?.first_name}
                  referrerPolicy="no-referrer"
                  className="aspect-square w-[30px] rounded-full object-cover ring-2 ring-indigo-500/50"
                />
              </Link>

              <button
                onClick={() => dispatch(logout(navigate))}
                className="text-richblack-100 hover:text-white text-2xl transition-colors duration-200"
                title="Logout"
              >
                <VscSignOut />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
