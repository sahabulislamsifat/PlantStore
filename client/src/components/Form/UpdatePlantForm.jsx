import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { uploadImage } from "../../api/utils/utils";
import { TbFidgetSpinner } from "react-icons/tb";

const UpdatePlantForm = ({ plant, setIsEditModalOpen, refetch, isLoading }) => {
  const axiosSecure = useAxiosSecure();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: "",
    image: "",
  });

  useEffect(() => {
    if (plant) {
      setFormData({
        name: plant.name || "",
        category: plant.category || "",
        description: plant.description || "",
        price: plant.price || "",
        quantity: plant.quantity || "",
        image: plant.image || "",
      });
    }
  }, [plant]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let updatedData = { ...formData };

      // If image is a File, upload it using your custom uploadImage function
      if (formData.image instanceof File) {
        const imageUrl = await uploadImage(formData.image);
        updatedData.image = imageUrl;
      }

      await axiosSecure.put(`/plants/${plant._id}`, updatedData);
      toast.success("Plant updated successfully!");
      refetch();
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.response.data);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 gap-10">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-1 text-sm">
              <label htmlFor="name" className="block text-gray-600">
                Name
              </label>
              <input
                className="bg-gray-50 w-full px-4 py-3 border border-lime-300 rounded-md"
                name="name"
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1 text-sm">
              <label htmlFor="category" className="block text-gray-600">
                Category
              </label>
              <select
                required
                className="w-full px-4 bg-gray-50 py-3 border-lime-300 rounded-md"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Succulent">Succulent</option>
                <option value="Flowering">Flowering</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1 text-sm">
              <label htmlFor="description" className="block text-gray-600">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write plant description here..."
                className="w-full h-32 px-4 py-3 bg-gray-50 border border-lime-300 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* Price and Quantity */}
            <div className="flex justify-between gap-2">
              <div className="space-y-1 text-sm w-full">
                <label htmlFor="price" className="block text-gray-600">
                  Price
                </label>
                <input
                  name="price"
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-lime-300 rounded-md"
                  required
                />
              </div>
              <div className="space-y-1 text-sm w-full">
                <label htmlFor="quantity" className="block text-gray-600">
                  Quantity
                </label>
                <input
                  name="quantity"
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-gray-50 px-4 py-3 border border-lime-300 rounded-md"
                  required
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="mt-1"
              />
              {typeof formData.image === "string" && (
                <img
                  src={formData.image}
                  alt="preview"
                  className="mt-2 h-20 rounded border"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full p-3 mt-5 text-white bg-lime-500 rounded shadow-md hover:bg-lime-600"
            >
              {isLoading ? (
                <TbFidgetSpinner className="animate-spin m-auto" />
              ) : (
                "Update Plant"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

UpdatePlantForm.propTypes = {
  plant: PropTypes.object.isRequired,
  setIsEditModalOpen: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default UpdatePlantForm;
