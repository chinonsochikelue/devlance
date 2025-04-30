'use client';

import React, { useState } from 'react';

function UsePreviewImage() {
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return { imageUrl, handleImageChange };
}

export default UsePreviewImage;
