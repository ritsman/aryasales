import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";

const Size1 = () => {
  const navigate = useNavigate();
  const [sizes, setSizes] = useState([]);
  const [isModify , setIsModify] = useState(false);

  // Fetch sizes from API
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await axios.get(
          `${config.API_URL}/api/master/getSizes`
        );
        setSizes(response.data);
      } catch (error) {
        console.error("Error fetching sizes:", error);
      }
    };
    fetchSizes();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Size List</h2>

      {/* Add Size Button */}
      <button
        onClick={() => navigate("addForm")}
        className="mb-4 px-4 py-2 bg-[#310b6b] text-white rounded-lg hover:bg-blue-600"
      >
        Add Size
      </button>

      {/* Size Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Size Name</th>
            <th className="border p-2">Number of Sizes</th>
            <th className="border p-2">Sizes</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((size) => (
            <tr key={size._id} className="border text-center">
              <td className="border p-2">{size.sizeName}</td>
              <td className="border p-2">{size.sizes.length}</td>

              <td className="border p-2">{size.sizes.join(", ")}</td>
              <td className="border p-2">
                <button
                  onClick={async () => {
                    setIsModify(!isModify);
                  }}
                  className="px-3 py-1 mr-2 bg-[#310b6b] text-white rounded-lg hover:bg-blue-600"
                >
                  Modify
                </button>
                {isModify && (
                  <button
                    onClick={() =>
                      navigate("addForm", {
                        state: {
                          sizeName: size.sizeName,
                          sizes: size.sizes,
                          id: size._id,
                        },
                      })
                    }
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 mr-2"
                  >
                    Edit
                  </button>
                )}
                {isModify && (
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete?")) {
                        await axios.delete(
                          `${config.API_URL}/api/master/deleteSize/${size._id}`
                        );
                        setSizes(sizes.filter((s) => s._id !== size._id));
                      }
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Size1;
