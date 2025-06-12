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
