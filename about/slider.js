// Initialize Swiper
var swiper = new Swiper(".mySwiper", {
  /* حل جذري: تم تغيير القيمة إلى 'auto' لعرض شريحة واحدة فقط وتجاهل أجزاء الشرائح الأخرى على الجوال */
  slidesPerView: 'auto',            
  spaceBetween: 10,             
  /* حل جذري: تم إزالة خاصية centeredSlides لمنع ظهور الشرائح جزئياً على الجوال */
  // centeredSlides: true,          
  loop: true,                    
  autoplay: {
    delay: 4000,                 
    disableOnInteraction: false, 
  },
  pagination: {
    el: ".swiper-pagination",    
    clickable: true,             
  },
  navigation: {
    nextEl: ".swiper-button-next", 
    prevEl: ".swiper-button-prev", 
  },
});
