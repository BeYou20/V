// Fetch images from the Google Sheets API and create slides
const googleSheetsUrl = 'https://script.google.com/macros/s/AKfycbxjc5q9dMRNBoFHPwbiyDXxDZQp9fGOIsWOMg_4JwJIJriiRKOSHGtw58RdCtecXfe2Tw/exec';

fetch(googleSheetsUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const swiperWrapper = document.querySelector('.image-swiper .swiper-wrapper');
    swiperWrapper.innerHTML = '';

    data.images.forEach(image => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const img = document.createElement('img');
      img.src = image.url;
      img.alt = image.name; // تم تعديل هذا السطر ليعمل مع الكود الجديد
      
      slide.appendChild(img);
      swiperWrapper.appendChild(slide);
    });

    // Initialize Swiper ONLY after slides have been added
    var imageSwiper = new Swiper('.image-swiper', {
      slidesPerView: 1,
      spaceBetween: 0,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    // Make the swiper visible
    document.querySelector('.image-swiper').style.opacity = '1';
  })
  .catch(error => console.error('Error fetching images:', error));
