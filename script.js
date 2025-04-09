document.addEventListener("DOMContentLoaded", async () => {
    let galleryData = [];
    let currentEntryIndex = 0;
    let currentImageIndex = 0;
    let currentImageList = [];

    const galleryGrid = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-description');
    const lightboxTags = document.getElementById('lightbox-tags');
    const lightboxThumbs = document.getElementById('lightbox-thumbs');
    const lightboxRef = document.getElementById('lightbox-ref');
    const shopGrid = document.getElementById('shop-grid');

    const res = await fetch('gallery.json');
    galleryData = await res.json();
    galleryData.sort((a, b) => new Date(b.date) - new Date(a.date));


    // Utility to update main lightbox image
    function setMainImage(index) {
        const src = currentImageList[index] || 'assets/alt.jpg';
        lightboxImg.classList.add('fade-out');

        setTimeout(() => {
            lightboxImg.src = src;

            lightboxImg.onload = () => {
                lightboxImg.classList.remove('fade-out');
            };
            lightboxImg.onerror = () => {
                lightboxImg.src = 'assets/alt.jpg';
                lightboxImg.classList.remove('fade-out');
            };

            const caption = document.getElementById('lightbox-caption');
            if (caption) {
                caption.textContent = `${galleryData[currentEntryIndex].name} – Image ${index + 1} of ${currentImageList.length}`;
            }
        }, 200);
    }

    function showLightboxEntry(index) {
        const entry = galleryData[index];
        currentImageList = entry.images;
        currentImageIndex = 0;

        // Preload all images
        currentImageList.forEach(src => new Image().src = src);

        setMainImage(0);
        // Mark the first thumb as selected
        setTimeout(() => {
            const firstThumb = lightboxThumbs.querySelector('img');
            if (firstThumb) firstThumb.classList.add('selected');
        }, 0);
        // Update text and tags
        lightboxTitle.textContent = entry.name;
        lightboxDesc.textContent = `From: ${entry.from} — ${entry.date}`;

        lightboxTags.innerHTML = '';
        entry.from.split(',').forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag.trim();
            lightboxTags.appendChild(span);
        });

        // Populate thumbnails
        lightboxThumbs.innerHTML = '';
        currentImageList.forEach((img, i) => {
            const thumb = document.createElement('img');
            thumb.src = img;
            thumb.alt = "thumb";
            thumb.loading = "lazy";
            thumb.onerror = () => thumb.src = 'assets/alt.jpg';

            thumb.addEventListener('click', () => {
                if (currentImageIndex === i) return;
                currentImageIndex = i;
                setMainImage(i);

                // Highlight selected thumbnail
                const allThumbs = lightboxThumbs.querySelectorAll('img');
                allThumbs.forEach(t => t.classList.remove('selected'));
                thumb.classList.add('selected');
            });


            lightboxThumbs.appendChild(thumb);
        });

        // Reference image
        lightboxRef.src = entry.reference || 'assets/alt.jpg';
        lightboxRef.onerror = () => lightboxRef.src = 'assets/alt.jpg';

        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        const scrollable = document.querySelector('.lightbox-content.two-column');
        const track = document.querySelector('.custom-scrollbar-track');
        const thumb = document.querySelector('.custom-scrollbar-thumb');

        function updateThumb() {
            const scrollTop = scrollable.scrollTop;
            const scrollHeight = scrollable.scrollHeight - scrollable.clientHeight;
            const percent = scrollTop / scrollHeight;

            const trackHeight = track.clientHeight;
            const thumbHeight = thumb.offsetHeight;
            const top = percent * (trackHeight - thumbHeight);

            thumb.style.transform = `translateY(${top}px)`;
        }

        scrollable.addEventListener('scroll', updateThumb);
        setTimeout(updateThumb, 100); // Initial sync



    }

    // Build gallery cards
    galleryData.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('data-id', entry.id);

        const thumb = document.createElement('img');
        thumb.src = entry.images[0] || 'assets/alt.jpg';
        thumb.onerror = () => thumb.src = 'assets/alt.jpg';
        thumb.alt = entry.name;
        thumb.loading = "lazy";

        const label = document.createElement('p');
        label.textContent = entry.name;

        card.appendChild(thumb);
        card.appendChild(label);

        // Append to .gallery-grid inside the scrollbox
        galleryGrid.appendChild(card);

        card.addEventListener('click', () => {
            currentEntryIndex = galleryData.findIndex(e => e.id === entry.id);
            showLightboxEntry(currentEntryIndex);
        });
    });


    // Close lightbox
    document.querySelector('.close').addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

    // Prev/Next buttons
    document.getElementById('lightbox-prev').addEventListener('click', () => {
        currentEntryIndex = (currentEntryIndex - 1 + galleryData.length) % galleryData.length;
        showLightboxEntry(currentEntryIndex);
    });

    document.getElementById('lightbox-next').addEventListener('click', () => {
        currentEntryIndex = (currentEntryIndex + 1) % galleryData.length;
        showLightboxEntry(currentEntryIndex);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const isOpen = !lightbox.classList.contains('hidden');
        if (!isOpen) return;

        if (e.key === 'ArrowRight') {
            lightboxImg.classList.add('fade-out');
            setTimeout(() => {
                currentEntryIndex = (currentEntryIndex + 1) % galleryData.length;
                showLightboxEntry(currentEntryIndex);
            }, 400);
        } else if (e.key === 'ArrowLeft') {
            lightboxImg.classList.add('fade-out');
            setTimeout(() => {
                currentEntryIndex = (currentEntryIndex - 1 + galleryData.length) % galleryData.length;
                showLightboxEntry(currentEntryIndex);
            }, 400);
        } else if (e.key === 'Escape') {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // Shop loader
    if (shopGrid) {
        fetch('shop.json')
            .then(res => res.json())
            .then(products => {
                products.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/alt.jpg'">
                        <h3>${item.name}</h3>
                        <p>${item.price}</p>
                        <a href="${item.link}" target="_blank" class="kofi-button">Shop Now</a>
                    `;
                    shopGrid.appendChild(card);
                });
            })
            .catch(err => {
                console.error("Failed to load shop.json", err);
                shopGrid.innerHTML = "<p>Shop is temporarily unavailable.</p>";
            });
    }
    lightbox.addEventListener('click', (e) => {
        const isInside = e.target.closest('.lightbox-content, .lightbox-nav');
        if (!isInside) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });
    const shopWrapper = document.querySelector('.shop-carousel-wrapper');
    const shopTrack = document.getElementById('shop-grid');

    const scrollAmount = 300;

    shopWrapper.querySelector('.shop-nav-left').addEventListener('click', () => {
        shopTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    shopWrapper.querySelector('.shop-nav-right').addEventListener('click', () => {
        shopTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    
});
