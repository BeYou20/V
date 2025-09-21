
    document.addEventListener("DOMContentLoaded", function() {
        const searchInput = document.getElementById('courseSearch');
        const searchResultsInfo = document.getElementById('searchResultsInfo');
        const courseSections = document.querySelectorAll('section');
        const allCourseButtons = document.querySelectorAll('.course-button');

        const updateSearchResults = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            let foundCount = 0;
            const sectionsToDisplay = new Set();
            
            allCourseButtons.forEach(button => {
                const buttonText = button.textContent.toLowerCase();
                const parentSection = button.closest('section');
                
                if (searchTerm === '' || buttonText.includes(searchTerm)) {
                    button.style.display = 'flex';
                    foundCount++;
                    sectionsToDisplay.add(parentSection.id);
                } else {
                    button.style.display = 'none';
                }
            });

            courseSections.forEach(section => {
                const sectionGrid = section.querySelector('.course-grid');
                const sectionTitle = section.querySelector('.section-title');
                
                if (sectionsToDisplay.has(section.id) && searchTerm !== '') {
                    sectionGrid.classList.add('active');
                    sectionTitle.classList.add('active');
                    sectionGrid.style.maxHeight = sectionGrid.scrollHeight + "px";
                    sectionGrid.style.paddingTop = "10px";
                    sectionGrid.style.paddingBottom = "20px";
                } else {
                    sectionGrid.classList.remove('active');
                    sectionTitle.classList.remove('active');
                    sectionGrid.style.maxHeight = "0";
                    sectionGrid.style.paddingTop = "0";
                    sectionGrid.style.paddingBottom = "0";
                }
            });

            if (searchTerm === '') {
                searchResultsInfo.textContent = '';
                courseSections.forEach(section => {
                    const sectionGrid = section.querySelector('.course-grid');
                    sectionGrid.classList.remove('active');
                    sectionGrid.style.maxHeight = '0';
                    sectionGrid.style.paddingTop = "0";
                    sectionGrid.style.paddingBottom = "0";
                    section.querySelectorAll('.course-button').forEach(button => button.style.display = 'flex');
                });
            } else {
                if (foundCount > 0) {
                    searchResultsInfo.textContent = `تم العثور على ${foundCount} دورة.`;
                } else {
                    searchResultsInfo.textContent = 'لم يتم العثور على أي دورة.';
                }
            }
        };

        searchInput.addEventListener('input', updateSearchResults);

        // وظيفة الطي والتوسيع
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.addEventListener('click', () => {
                const courseGrid = title.nextElementSibling;
                
                // إغلاق أي قسم آخر مفتوح
                document.querySelectorAll('.course-grid.active').forEach(grid => {
                    if (grid !== courseGrid) {
                        grid.classList.remove('active');
                        grid.previousElementSibling.classList.remove('active');
                        grid.style.maxHeight = "0";
                        grid.style.paddingTop = "0";
                        grid.style.paddingBottom = "0";
                    }
                });
                
                courseGrid.classList.toggle('active');
                title.classList.toggle('active');

                // إعادة حساب الـ max-height لضمان سلاسة الانتقال
                if (courseGrid.classList.contains('active')) {
                    courseGrid.style.maxHeight = courseGrid.scrollHeight + "px";
                    courseGrid.style.paddingTop = "10px";
                    courseGrid.style.paddingBottom = "20px";
                } else {
                    courseGrid.style.maxHeight = "0";
                    courseGrid.style.paddingTop = "0";
                    courseGrid.style.paddingBottom = "0";
                }
            });
        });
    });
