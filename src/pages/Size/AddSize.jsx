import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const AddSize = () => {
 const navigate = useNavigate();
 const location = useLocation();

 // Provide safe default values to prevent undefined errors
 const initialData = location.state || { sizeName: "", sizes: [], id: null };

 // State Variables
 const [sizeName, setSizeName] = useState(initialData.sizeName);
 const [sizes, setSizes] = useState(initialData.sizes);

 // ✅ Only update state when component mounts (no dependencies)
 useEffect(() => {
   if (!location.state) {
     setSizeName("");
     setSizes([]);
   }
 }, []); // ✅ Empty dependency array prevents infinite re-renders.

 // Handle size input change
 const handleSizeChange = (index, value) => {
   const updatedSizes = [...sizes];
   updatedSizes[index] = value;
   setSizes(updatedSizes);
 };

 // Handle form submission (Create or Update)
 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     if (initialData.id) {
        console.log("callllllleddd", sizeName, sizes, initialData.id);
        console.log("id",initialData.id)
       // Update existing entry
       await axios.put(
         `${config.API_URL}/api/master/updateSize/${initialData.id}`,
         {
           sizeName,
           sizes,
         }
       );
       alert("Size updated successfully!");
     } else {
       // Create new entry
       await axios.post(`${config.API_URL}/api/master/createSize`, {
         sizeName,
         sizes,
       });
       alert("Size added successfully!");
     }
     navigate(-1); // Redirect to size list
   } catch (error) {
     console.error("Error saving size:", error);
     alert("Failed to save!");
   }
 };

  const handleRemoveSize = (index) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

 return (
   <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
     <h2 className="text-2xl font-bold mb-4 text-gray-700">
       {initialData.id ? "Edit Size" : "Add Size"}
     </h2>

     <form onSubmit={handleSubmit}>
       <div className="mb-4">
         <label className="block font-semibold text-gray-600 mb-1">
           Size Name
         </label>
         <input
           type="text"
           className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
           value={sizeName}
           onChange={(e) => setSizeName(e.target.value)}
         />
       </div>

       {/* Dynamic Size Inputs */}
       <div className="mb-4">
         <label className="block font-semibold text-gray-600 mb-1">Sizes</label>
         {sizes.map((size, index) => (
           <div key={index} className="flex items-center space-x-2 mb-2">
             <input
               type="text"
               className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300"
               value={size}
               onChange={(e) => handleSizeChange(index, e.target.value)}
               placeholder={`Size ${index + 1}`}
             />
             {/* Remove Button */}
             <button
               type="button"
               onClick={() => handleRemoveSize(index)}
               className="px-2 py-1 bg-gray-200 text-white rounded hover:bg-gray-600"
             >
               ❌
             </button>
           </div>
         ))}
       </div>

       {/* Add New Size Field */}
       <button
         type="button"
         onClick={() => setSizes([...sizes, ""])}
         className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
       >
         + Add More
       </button>

       {/* Buttons */}
       <div className="mt-6 flex justify-between">
         <button
           type="button"
           onClick={() => navigate(-1)}
           className="px-4 py-2 bg-[#310b6b] text-white rounded-lg hover:bg-blue-600"
         >
           Back
         </button>

         <button
           type="submit"
           className="px-4 py-2 bg-[#310b6b] text-white rounded-lg hover:bg-blue-600"
         >
           {initialData.id ? "Update" : "Submit"}
         </button>
       </div>
     </form>
   </div>
 );
};

export default AddSize;
