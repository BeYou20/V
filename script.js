// وظيفة للحصول على معرف المقرر الدراسي من عنوان URL
function getCourseIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// وظيفة للعثور على بيانات المقرر الدراسي عن طريق المعرف
function findCourseById(id, courses) {
    return courses.find(course => course.id === id);
}

// وظيفة لتحليل سلسلة الأسئلة الشائعة
function parseFaqString(faqString) {
    const obj = {};
    if (!faqString) return obj;
    faqString.split('.').forEach(pair => {
        const [q, a] = pair.split(':');
        if (q && a) obj[q.trim()] = a.trim();
    });
    return obj;
}

// الوظيفة الرئيسية لجلب المقررات الدراسية من الخادم
async function getCoursesFromServer() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwY-4cac3jIZ-OHP1l3p4Fb4oiEgonQvxKu5h7swhpov8iMZXmQ7VpDTX_GG5zq9kIn2g/exec');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // تحويل البيانات إلى الهيكل المطلوب
        return data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.courseAbout,
            marquee: item.marqueeText,
            objectives: (item.objectives || '').split('|').map(s => s.trim()),
            axes: (item.axes || '').split('|').map(s => s.trim()),
            instructors: item.instructors,
            testimonials: (item.testimonials || []).map(t => ({ text: (t.text || '').split(' - ')[0], name: (t.text || '').split(' - ')[1] })),
            faq: Object.entries(parseFaqString(item.faqs)).map(([q, a]) => ({ question: q, answer: a })),
            achievements: (item.achievementsText || '').split('|').join('<br>')
        }));
    } catch (err) {
        console.error('Error fetching courses:', err);
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = '<h1>عفواً، حدث خطأ أثناء جلب البيانات.</h1><p>يرجى المحاولة مرة أخرى لاحقاً.</p>';
        }
        return [];
    }
}

// وظيفة لتعبئة الصفحة ببيانات المقرر الدراسي
function populatePage(course) {
    // تحديث عنوان الصفحة
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) pageTitleElement.textContent = course.title.replace(/<[^>]*>?/gm, '');

    // تحديث قسم البطل
    const heroTitleElement = document.getElementById('hero-title');
    if (heroTitleElement) heroTitleElement.innerHTML = course.title;

    const heroDescriptionElement = document.getElementById('hero-description');
    if (heroDescriptionElement) heroDescriptionElement.textContent = course.description;

    // تحديث سرادق
    const marqueeTextElement = document.getElementById('marquee-text');
    if (marqueeTextElement) marqueeTextElement.textContent = course.marquee;

    // تحديث الدورة حول
    const courseAboutElement = document.getElementById('course-about');
    if (courseAboutElement) courseAboutElement.textContent = course.description;

    // تحديث قائمة الأهداف
    const objectivesList = document.getElementById('objectives-list');
    if (objectivesList) {
        objectivesList.innerHTML = ''; // مسح المحتوى السابق
        course.objectives.forEach(obj => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-bullseye"></i> ${obj}`;
            objectivesList.appendChild(li);
        });
    }

    // تحديث قائمة المحاور
    const axesList = document.getElementById('axes-list');
    if (axesList) {
        axesList.innerHTML = ''; // مسح المحتوى السابق
        course.axes.forEach(axis => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-calendar-alt"></i> ${axis}`;
            axesList.appendChild(li);
        });
    }
  
    // تحديث نص الإنجازات
    const achievementsTextElement = document.getElementById('achievements-text');
    if (achievementsTextElement) achievementsTextElement.innerHTML = course.achievements;

    // تحديث حقل النموذج المخفي
    const courseNameInput = document.getElementById('course-name-input');
    if (courseNameInput) {
        courseNameInput.value = course.title.replace(/<[^>]*>?/gm, '').trim();
    }

    // ملء شريط تمرير المدربين
    const instructorsSlider = document.getElementById('instructors-slider');
    if (instructorsSlider) {
        const instructorDotsContainer = instructorsSlider.querySelector('.instructor-dots');
        instructorsSlider.querySelectorAll('.instructor-slide').forEach(slide => slide.remove());
        
        course.instructors.forEach((instructor, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('instructor-slide');
            if (index === 0) slideDiv.classList.add('active');
            slideDiv.innerHTML = `
                <div class="instructor-card">
                    <img src="https://i.ibb.co/L519VjL/certificate.png" alt="صورة المدرب">
                    <h4>${instructor.name}</h4>
                    <p>${instructor.expertise}</p>
                </div>
            `;
            instructorsSlider.insertBefore(slideDiv, instructorDotsContainer);
        });
    }

    // ملء الشهادات المتزلج
    const testimonialsSlider = document.getElementById('testimonials-slider');
    if (testimonialsSlider) {
        const testimonialDotsContainer = testimonialsSlider.querySelector('.testimonial-dots');
        testimonialsSlider.querySelectorAll('.testimonial-slide').forEach(slide => slide.remove());

        course.testimonials.forEach((testimonial, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('testimonial-slide');
            if (index === 0) slideDiv.classList.add('active');
            slideDiv.innerHTML = `
                <p class="testimonial-text">"${testimonial.text}"</p>
                <p>– ${testimonial.name}</p>
            `;
            testimonialsSlider.insertBefore(slideDiv, testimonialDotsContainer);
        });
    }

    // تعبئة قسم الأسئلة الشائعة
    const faqContainer = document.getElementById('faq-container');
    if (faqContainer) {
        faqContainer.innerHTML = ''; // مسح المحتوى السابق
        course.faq.forEach(item => {
            const faqItem = document.createElement('div');
            faqItem.classList.add('faq-item');
            faqItem.innerHTML = `
                <div class="faq-question">${item.question} <i class="fas fa-chevron-down"></i></div>
                <div class="faq-answer">${item.answer}</div>
            `;
            faqContainer.appendChild(faqItem);
        });
    }

    // إعادة تهيئة البرامج النصية الديناميكية
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
    initSliders();
    initFaqToggle();
}

// الوظيفة الرئيسية للتشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    const courses = await getCoursesFromServer();
    const courseId = getCourseIdFromUrl();
    const courseData = findCourseById(courseId, courses);

    if (courseData) {
        populatePage(courseData);
    } else {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = '<h1>عفواً، لم يتم العثور على الدورة المطلوبة.</h1><p>يرجى التأكد من الرابط والمحاولة مرة أخرى.</p>';
        }
    }
    
    // إرسال النموذج ومنطق الزر اللاصق
    const stickyRegisterBtn = document.querySelector('.sticky-register-btn');
    const stickyWhatsappBtn = document.querySelector('.sticky-whatsapp-btn');
    const footer = document.querySelector('footer');

    if (stickyRegisterBtn && stickyWhatsappBtn && footer) {
        window.addEventListener('scroll', () => {
            const isAtBottom = window.innerHeight + window.scrollY >= footer.offsetTop - 50;
            if (window.scrollY > 300 && !isAtBottom) {
                stickyRegisterBtn.classList.remove('hidden');
                stickyWhatsappBtn.classList.remove('hidden');
            } else {
                stickyRegisterBtn.classList.add('hidden');
                stickyWhatsappBtn.classList.add('hidden');
            }
        });
    }

    const scriptURL = 'https://script.google.com/macros/s/AKfycbztWgyn56xZxcgj3S9TVLnR47CfEFluzCX8q-VDL3THa-NCZCBsyEm9Hk2UyjyV39DMuw/exec';
    const form = document.forms['form'];
    if (form) {
        const submitButton = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(form);
            const phoneInput = form.querySelector('input[name="phone"]');
            if (phoneInput) formData.set('phone', phoneInput.value.replace(/\s/g, ''));

            let formDataStored = {};
            for (let [key, value] of formData.entries()) {
                formDataStored[key] = value;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'جاري الإرسال...';
            }

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(response => {
                    const message = generateWhatsAppMessage(formDataStored);
                    const encodedMessage = encodeURIComponent(message);
                    const whatsappLink = `https://wa.me/967778185189?text=${encodedMessage}`;
                    window.location.href = whatsappLink;
                })
                .catch(error => {
                    alert('حدث خطأ أثناء الإرسال. حاول مرة أخرى.');
                })
                .finally(() => {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = 'إرسال البيانات';
                    }
                });
        });
    }

    function generateWhatsAppMessage(data) {
        const courseTitleElement = document.getElementById('page-title');
        const courseTitle = courseTitleElement ? courseTitleElement.textContent : 'الدورة غير معروفة';
        return `السلام عليكم، تم التسجيل في دورة "${courseTitle}".
الاسم: ${data.name || ''}
الجنس: ${data.gender || ''}
العمر: ${data.age || ''}
البلد: ${data.country || ''}
رقم الهاتف: ${data.phone || ''}
رابط التيليجرام: ${data.Telegram || ''}
أرجو إتمام التسجيل في الدورة.`;
    }

    // أشرطة التمرير ووظائف الأسئلة الشائعة
    // ملاحظة: يجب تعريف وظائف initSliders و initFaqToggle في مكان آخر في ملفك
    // ...
});
