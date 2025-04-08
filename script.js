document.addEventListener("DOMContentLoaded", async () => {
    let galleryData = [];
    let currentEntryIndex = 0;
    let currentImageIndex = 0;
    let currentImageList = [];

    const galleryGrid = document.querySelector('.gallery-grid');
    const res = await fetch('gallery.json');
    const data = await res.json();
    galleryData = data;

    data.forEach(entry => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('data-id', entry.id);
        card.setAttribute('data-title', entry.name);
        card.setAttribute('data-description', `From: ${entry.from} — ${entry.date}`);
        card.setAttribute('data-tags', entry.from);
        card.setAttribute('data-images', JSON.stringify(entry.images));
        card.setAttribute('data-reference', entry.reference);

        const thumb = document.createElement('img');
        thumb.src = entry.images[0] || 'assets/alt.jpg';
        thumb.onerror = () => thumb.src = 'assets/alt.jpg';
        thumb.alt = entry.name;
        thumb.loading = "lazy";

        const label = document.createElement('p');
        label.textContent = entry.name;

        card.appendChild(thumb);
        card.appendChild(label);
        galleryGrid.appendChild(card);

        // Click handler
        card.addEventListener('click', () => {
            currentEntryIndex = galleryData.findIndex(e => e.id === entry.id);
            showLightboxEntry(currentEntryIndex);
        });
    });

    // Lightbox elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-description');
    const lightboxTags = document.getElementById('lightbox-tags');
    const lightboxThumbs = document.getElementById('lightbox-thumbs');
    const lightboxRef = document.getElementById('lightbox-ref');

    function showLightboxEntry(index) {
        const entry = galleryData[index];
        currentImageList = entry.images;
        currentImageIndex = 0;

        // Set main image
        lightboxImg.src = currentImageList[0] || 'assets/alt.jpg';
        lightboxImg.onerror = () => lightboxImg.src = 'assets/alt.jpg';

        // Text
        lightboxTitle.textContent = entry.name;
        lightboxDesc.textContent = `From: ${entry.from} — ${entry.date}`;

        // Tags
        lightboxTags.innerHTML = '';
        entry.from.split(',').forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag.trim();
            lightboxTags.appendChild(span);
        });

        // Thumbs
        lightboxThumbs.innerHTML = '';
        currentImageList.forEach((img, i) => {
            const thumb = document.createElement('img');
            thumb.src = img;
            thumb.alt = "thumb";
            thumb.loading = "lazy";
            thumb.onerror = () => thumb.src = 'assets/alt.jpg';
            thumb.addEventListener('click', () => {
                currentImageIndex = i;
                lightboxImg.src = currentImageList[i];
            });
            lightboxThumbs.appendChild(thumb);
        });

        // Reference image
        lightboxRef.src = entry.reference || 'assets/alt.jpg';
        lightboxRef.onerror = () => lightboxRef.src = 'assets/alt.jpg';

        lightbox.classList.remove('hidden');
    }

    // Close lightbox
    document.querySelector('.close').addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });

    // Prev/Next navigation
    document.getElementById('lightbox-prev').addEventListener('click', () => {
        currentEntryIndex = (currentEntryIndex - 1 + galleryData.length) % galleryData.length;
        showLightboxEntry(currentEntryIndex);
    });

    document.getElementById('lightbox-next').addEventListener('click', () => {
        currentEntryIndex = (currentEntryIndex + 1) % galleryData.length;
        showLightboxEntry(currentEntryIndex);
    });

    // Shop loader
    const shopGrid = document.getElementById('shop-grid');
    if (shopGrid) {
        fetch('shop.json')
            .then(res => res.json())
            .then(products => {
                products.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'product-card';

                    card.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
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
});
