import axios from "axios";
//* Upload image and return the URL

export const uploadImage = async (imageData) => {
  const formData = new FormData();
  formData.append("image", imageData);

  // 1. send data to imgbb Continue your registr ation logic with imageUrl
  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGE_API_KEY}`,
    formData
  );

  return response.data.data.url;
};

export const saveUser = async (user) => {
  await axios.post(
    `${import.meta.env.VITE_API_URL}/user/${user?.email}`,
    {
      name: user?.displayName,
      email: user?.email,
      photoURL: user?.photoURL,
    }
    // { withCredentials: true }
  );
};
