import { Outlet, useNavigate} from "react-router-dom";
import { ChevronRight, Users, Package, Activity, Settings, MapPin, Palette, Hash, Layers, FolderOpen, ShoppingCart } from 'lucide-react';

const cards = [
  { name: "Party", path: "party1", desc: "Listing of all Customers and Vendors" },
  { name: "Unit", path: "unit1", desc: "Listing of all Units of Measurement" },
  { name: "Item", path: "item1", desc: "Listing of all Units of Measurement" },
  { name: "Activity", path: "activity", desc: "Listing of all Activities" },
  { name: "Process", path: "process", desc: "Listing of all the Processes" },
  { name: "Location", path: "location", desc: "Listing of all Locations" },
  { name: "Size", path: "size", desc: "Listing of all Sizes" },
  { name: "Color", path: "color", desc: "Listing of all Colors" },
  { name: "SKU Management", path: "skuManagement", desc: "Listing of all Colors" },
  { name: "Group", path: "group1", desc: "Listing of all groups" },
  { name: "Product", path: "product", desc: "Listing of all Products" },
];

const getIcon = (name) => {
  const icons = {
    "Party": Users,
    "Unit": Package,
    "Item": Package,
    "Activity": Activity,
    "Process": Settings,
    "Location": MapPin,
    "Size": Hash,
    "Color": Palette,
    "SKU Management": Hash,
    "Group": FolderOpen,
    "Product": ShoppingCart
  };
  
  const IconComponent = icons[name] || Layers;
  return <IconComponent className="w-6 h-6" />;
};

const getGradient = (index) => {
  const gradients = [
    "from-blue-500 to-blue-600",
    "from-green-500 to-green-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-red-500 to-red-600",
    "from-teal-500 to-teal-600",
    "from-indigo-500 to-indigo-600",
    "from-pink-500 to-pink-600",
    "from-yellow-500 to-yellow-600",
    "from-cyan-500 to-cyan-600",
    "from-emerald-500 to-emerald-600"
  ];
  
  return gradients[index % gradients.length];
};

export default function MasterIndex() {
    const navigate = useNavigate();
  const handleCardClick = (path) => {
    console.log(`Navigating to: ${path}`);
    // Add your navigation logic here
    navigate(`${path}`) //if using React Router
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Main Master
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Access and manage all Entry Data here
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.path}
              onClick={() => handleCardClick(card.path)}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              {/* Gradient header */}
              <div className={`h-2 bg-gradient-to-r ${getGradient(index)}`}></div>
              
              <div className="p-6">
                {/* Icon and title */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${getGradient(index)} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {getIcon(card.name)}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                {/* Card content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        {/* Stats or additional info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600">
              {cards.length} management modules available
            </span>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
    
  );
}