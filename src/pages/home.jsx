import React from "react";
import { Link } from "react-router-dom";
export const Home = () => {
  let cards = [
    {
      name: "Dashboard",
      path: "dashboard",
      desc: "Listing of all Customers and Vendors",
    },
    {
      name: "Profile",
      path: "profile",
      desc: "Profile",
    },
    // { name: "Unit", path: "unit", desc: "Listing of all Units of Measurement" },
    {
      name: "Gallery",
      path: "gallery",
      desc: "Listing of all Units of Measurement",
    },

    {
      name: "Sales",
      path: "sales",
      desc: "Listing of all Units of Measurement",
    },
    {
      name: "Work Order",
      path: "workorder",
      desc: "Listing of all Units of Measurement",
    },

    { name: "Material", path: "material", desc: "Listing of all Activities" },
    {
      name: "Inventory",
      path: "inventory",
      desc: "Listing of all the Processes",
    },
    { name: "Finance", path: "finance", desc: "Listing of all Locations" },

    {
      name: "Master",
      path: "master",
      desc: "Listing of all Units of Measurement",
    },
    {
      name: "Shipment",
      path: "shipment",
      desc: "Listing of all groups",
    },
    { name: "Scheduler", path: "scheduler", desc: "Listing of all Products" },
  ];
  return (
    <div>
      <div
        className="max-w-7xl mx-auto sm:px-6 lg:px-8 md:py-5 overflow-y-auto h-screen"
        style={{ height: "calc(100vh - 150px)" }}
      >
        <h1 className="text-3xl font-bold mb-6">Home</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {cards.map((card) => (
            <Link
              key={card.name}
              to={card.path}
              className="bg-white shadow-md rounded-md p-4 hover:bg-gray-100 transition-colors duration-200"
            >
              <h2 className="text-lg font-semibold mb-2">{card.name}</h2>
              <p className="text-gray-600"> Click to view {card.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};


