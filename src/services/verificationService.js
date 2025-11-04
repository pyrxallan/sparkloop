export const verifyPhoto = async (profileImage, selfieImage) => {
  const formData = new FormData();
  formData.append('api_key', import.meta.env.VITE_FACEPP_API_KEY);
  formData.append('api_secret', import.meta.env.VITE_FACEPP_API_SECRET);
  formData.append('image_file1', profileImage);
  formData.append('image_file2', selfieImage);

  const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  return data.confidence >= 80; // 80% threshold
};