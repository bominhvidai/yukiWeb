document.addEventListener("DOMContentLoaded", async () => {
    const galleryGrid = document.querySelector('.gallery-grid');
    const res = await fetch('gallery.json');
    const data = await res.json();

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

        const label = document.createElement('p');
        label.textContent = entry.name;

        card.appendChild(thumb);
        card.appendChild(label);
        galleryGrid.appendChild(card);
    });

    // Lightbox logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-description');
    const lightboxTags = document.getElementById('lightbox-tags');
    const lightboxThumbs = document.getElementById('lightbox-thumbs');
    const lightboxRef = document.getElementById('lightbox-ref');

    document.querySelectorAll('.gallery-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-description');
            const tags = card.getAttribute('data-tags');
            const images = JSON.parse(card.getAttribute('data-images'));
            const reference = card.getAttribute('data-reference') || 'assets/alt.jpg';

            // Set main image
            lightboxImg.src = images[0] || 'assets/alt.jpg';
            lightboxImg.onerror = () => lightboxImg.src = 'assets/alt.jpg';

            // Title and description
            lightboxTitle.textContent = title;
            lightboxDesc.textContent = desc;

            // Tags
            lightboxTags.innerHTML = '';
            tags.split(',').forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag.trim();
                lightboxTags.appendChild(span);
            });

            // Thumbnails
            lightboxThumbs.innerHTML = '';
            images.forEach(img => {
                const thumb = document.createElement('img');
                thumb.src = img;
                thumb.alt = "thumb";
                thumb.onerror = () => thumb.src = 'assets/alt.jpg';  // ✅ fallback if broken
                thumb.addEventListener('click', () => {
                    lightboxImg.src = img;
                });
                lightboxThumbs.appendChild(thumb);
            });

            // Reference
            lightboxRef.src = reference;
            lightboxRef.onerror = () => lightboxRef.src = 'assets/alt.jpg';

            lightbox.classList.remove('hidden');
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });
});
