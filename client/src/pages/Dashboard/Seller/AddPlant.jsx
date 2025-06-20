import { Helmet } from "react-helmet-async";
import AddPlantForm from "../../../components/Form/AddPlantForm";
import { uploadImage } from "./../../../api/utils/utils";
import useAuth from "./../../../hooks/useAuth";
import { useState } from "react";
import { axiosSecure } from "./../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddPlant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [uploadImageInfo, setUploadImageInfo] = useState({
    image: { name: "Upload Image" },
  });
  const [loading, setLoading] = useState(false);

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const name = form.name.value;
    const category = form.category.value;
    const quantity = parseFloat(form.quantity.value);
    const description = form.description.value;
    const price = parseFloat(form.price.value);
    const image = form.image.files[0];
    const imageUrl = await uploadImage(image);

    // seller info
    const seller = {
      name: user?.displayName,
      email: user?.email,
      photoURL: user?.photoURL,
    };

    // plant data
    const plantData = {
      name,
      category,
      quantity,
      description,
      price,
      image: imageUrl,
      seller,
    };
    // console.table(plantData);

    // send data to server
    try {
      // post request to add plant
      await axiosSecure.post("/plant", plantData);
      toast.success("Plant added successfully!");
      navigate("/dashboard/my-inventory");
    } catch (error) {
      console.error("Error adding plant:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Add Plant | Dashboard</title>
      </Helmet>

      {/* Form */}
      <AddPlantForm
        handleSubmit={handleSubmit}
        uploadImageInfo={uploadImageInfo}
        setUploadImageInfo={setUploadImageInfo}
        loading={loading}
      />
    </div>
  );
};

export default AddPlant;
