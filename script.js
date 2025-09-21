// Function to get the course ID from the URL
function getCourseIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to find course data by ID
function findCourseById(id, courses) {
    return courses.find(course => course.id === id);
}

// Function to parse FAQ string
function parseFaqString(faqString) {
    const obj = {};
    if (!faqString) return obj;
    faqString.split('.').forEach(pair => {
        const [q, a] = pair.split(':');
        if (q && a) obj[q.trim()] = a.trim();
    });
    return obj;
}

// Main function to fetch courses from server
async function getCoursesFromServer() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwY-4cac3jIZ-OHP1l3p4Fb4oiEgonQvxKu5h7swhpov8iMZXmQ7VpDTX_GG5zq9kIn2g/exec');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Convert data to the required structure
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

// Function to populate the page with course data
function populatePage(course) {
    // Update the page title
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) pageTitleElement.textContent = course.title.replace(/<[^>]*>?/gm, '');

    // Update Hero section
    const heroTitleElement = document.getElementById('hero-title');
    if (heroTitleElement) heroTitleElement.innerHTML = course.title;

    const heroDescriptionElement = document.getElementById('hero-description');
    if (heroDescriptionElement) heroDescriptionElement.textContent = course.description;

    // ... (Continue to check for element existence before updating)

    // Re-initialize dynamic scripts
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
    initSliders();
    initFaqToggle();
}

// Main function to run on page load
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
    
    // Form submission and sticky button logic
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

    // Sliders and FAQ functions
    // ... (initSliders and initFaqToggle functions remain the same but now will be called by populatePage)
});
