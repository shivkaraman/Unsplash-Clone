
let access_key = 'ZVjTBhMztzla0oaH_y1TgtZpcDZ-Qh9kwFZwQh4To3s';


let searchParam=``, previousSearchParam, search = false, page = 1;
const random_photo_url = `https://api.unsplash.com/photos/random?client_id=${access_key}&count=15`;
let search_photo_url = `https://api.unsplash.com/search/photos?client_id=${access_key}&query=${searchParam}&per_page=20`;

const body = document.querySelector('body');

const closeDropdown = dropdow => {
    document.addEventListener('click', e => {
        if(!e.target.closest('.download')){
            dropdow.classList.add('hide');
        }
    });
}

const downloadImage = img => {
    const download = document.querySelector('.download');

    const smallWidth = 640
	const smallHeight = Math.floor((img.height / img.width) * smallWidth)
	const mediumWidth = 1920
	const mediumHeight = Math.floor((img.height / img.width) * mediumWidth)
	const largeWidth = 2400
	const largeHeight = Math.floor((img.height / img.width) * largeWidth)

    const downloadHTML = 
        `<span class="download__btn" 
        data-id="${img.id}"
        data-width="${img.width}" 
        data-height="${img.height}" 
        onclick="downloadImage()">

            Download

        </span>
        <div class="dropdown">
            <span class="download__dropdown__arrow">
                <img src="img/down-arrow.svg" alt="down-arrow icon" class="download__dropdown__arrow__img"/>
            </span>
            <div class="dropdown__content hide">
                <span 
                data-id="${img.id}" 
                data-width="${smallWidth}" 
                data-height="${smallHeight}" 
                data-toggle-dropdown="true" 
                onclick="downloadImage()">
                    Small (${smallWidth}x${smallHeight})
                </span>

                <hr />

                <span 
                data-id="${img.id}" 
                data-width="${mediumWidth}" 
                data-height="${mediumHeight}"
                data-toggle-dropdown="true"
                onclick="downloadImage()">
                    Medium (${mediumWidth}x${mediumHeight})
                </span>

                <hr />

                <span 
                data-id="${img.id}" 
                data-width="${largeWidth}" 
                data-height="${largeHeight}"
                data-toggle-dropdown="true"
                onclick="downloadImage()">
                    Large (${largeWidth}x${largeHeight})
                </span>

                <hr />

                <span 
                data-id="${img.id}" 
                data-width="${img.width}" 
                data-height="${img.height}"
                data-toggle-dropdown="true"
                onclick="downloadImage()">
                    Original Size (${img.width}x${img.height})
                </span>
            </div>
        </div>`;
    
    download.innerHTML = downloadHTML;
    //Dropdown button functionality
    const dropdown = document.querySelector('.dropdown');
    dropdown.addEventListener('click', () => {
        console.log(dropdown.childNodes[3].classList.toggle('hide'));
        closeDropdown(dropdown.childNodes[3]);

    });
}

const displayImages = (images) => {
    const gallery = document.querySelector('.gallery');

    images.forEach(img => {
        gallery.innerHTML += 
        `
            <div class="gallery-img">
                <img src="${img.urls.small}" class="gallery__image" alt="">
                <div class="user">
                    <div class="user__container">
                        <img src="${img.user.profile_image.large}" class="user__img" alt="">
                        <p class="user__name">${img.user.name}</p>
                    </div>
                    <img src="img/download.svg" class="download__button" alt="">
                </div>
            </div>
        `;
        downloadImage(img);
    });
};

//Fetch images from api => Retuens an array of images
const fetchImages = async () => {

    const response = await fetch(random_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    
    displayImages(data);
}

const fetchSearchedImages = async() => {
    search_photo_url = `https://api.unsplash.com/search/photos/?client_id=${access_key}&query=${searchParam}&per_page=30&page=${page}`;
    console.log(searchParam);

    const response = await fetch(search_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    
    displayImages(data.results);
}

const loadSearchedImages = searchBox => {
    const gallery = document.querySelector('.gallery');
    searchBox.addEventListener('keyup', e => {
        
        searchParam = e.target.value.trim();
        
        if (previousSearchParam === searchParam) return;
        else previousSearchParam = searchParam; 
        
        gallery.innerHTML = '';
        fetchSearchedImages();
    });
}

const searchImage = async() => {
    
    const form = document.querySelector('form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        e.stopPropagation();
        search = true;
        
        loadSearchedImages(e.target[0]);
    });
}

const closePopup = popup => {
    document.addEventListener('click', e => {
        if(e.target.classList.contains('close-btn') || e.target.closest('.header-section')){
            popup.classList.add('hide');
            body.style.overflow = 'auto';   // Enable scroll
        }
    });
}

const showPopup = () => {
    const gallery = document.querySelector('.gallery');

    gallery.addEventListener('click', e => {
        if(!e.target.classList.contains('download__button') ){
            const popup = document.querySelector('.image-popup');
            popup.classList.toggle('hide');

            if (!popup.classList.contains('hide')) {
                body.style.overflow = "hidden"; // Disable scroll
            }
            const image = popup.childNodes[5];
            image.setAttribute('src', e.target.getAttribute('src'));

            if (!popup.classList.contains('hide')) {
                closePopup(popup);
            }
            else{
                body.style.overflow = 'auto'; 
            }
        }
    });
}

const callApi = () => {
    fetchImages(random_photo_url)
        .catch(err => {
            alert(`Error loading images : ${err}`);
        });
}

const infiniteScroll = () => {
    window.addEventListener('scroll', () => {
        // https://www.educative.io/answers/how-to-implement-infinite-scrolling-in-javascript
        if(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight-30){
            if(search) fetchSearchedImages();
            else callApi();
        }
    });
}

callApi();
infiniteScroll();
showPopup();
searchImage();