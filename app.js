
let access_key = 'LxhJHaSbSkByIspn7kJbPZLaJUspl-Tl6pj--Cikmms';


const gallery = document.querySelector('.gallery');
let searchParam=``, previousSearchParam, search = false, page = 1;
const random_photo_url = `https://api.unsplash.com/photos/random?client_id=${access_key}&count=30`;
let search_photo_url = `https://api.unsplash.com/search/photos?client_id=${access_key}&query=${searchParam}&per_page=50`;
let curr_images = {};

const body = document.querySelector('body');
const loader = document.querySelector('.flexbox');
const form = document.querySelector('form');

const fetchBackgroundImage = async () => {

	const response = await fetch(`https://api.unsplash.com/photos/random/?client_id=${access_key}&orientation=landscape&query=nature`);
	const json = await response.json();

	let headerSec = document.querySelector('.header-section');
	let backgroundImageUrl = ''

	//calulate which image to use as background Image based on window size
	if (window.innerWidth < 400) backgroundImageUrl = json.urls.small;
	else if (window.innerWidth < 1080) backgroundImageUrl = json.urls.regular;
	else backgroundImageUrl = json.urls.full;

	headerSec.style.background = `black url(${backgroundImageUrl}) no-repeat center center`;
	headerSec.style.backgroundSize = 'cover'
}

//Closing dropdown in pop-up
const closeDropdown = dropdow => {
    document.addEventListener('click', e => {
        if(!e.target.closest('.download')){
            dropdow.classList.add('hide');
        }
    });
}

//Function to downloads the image and saves it on local storage
const downloadImage = async (imageSrc, id) => {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);
  
    const link = document.createElement('a');
    link.href = imageURL;
    link.download = id;
    console.log(link.download);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

//Download image and dropdown on image popup
const downloadButtonSetup = img => {
    const download = document.querySelector('.download');

    const downloadHTML = 
        `<span class="download__btn" onclick="downloadImage('${img.regularImageUrl}', '${img.id}')"> Download </span>
        <div class="dropdown">
            <span class="download__dropdown__arrow">
                <img src="./img/downarrow.svg" alt="down-arrow icon" class="download__dropdown__arrow__img"/>
            </span>
            <div class="dropdown__content hide">
                <span onclick="downloadImage('${img.smallImageUrl}', '${img.id}')"> Small </span>
                <span onclick="downloadImage('${img.regularImageUrl}', '${img.id}')"> Medium </span>
                <span onclick="downloadImage('${img.fullImageUrl}', '${img.id}')"> Large </span>
                <hr />
                <span onclick="downloadImage('${img.rawImageUrl}', '${img.id}')"> Original Size </span>
            </div>
        </div>`;
    
    download.innerHTML = downloadHTML;
    //Dropdown button functionality
    const dropdown = document.querySelector('.dropdown');
    dropdown.addEventListener('click', () => {
        dropdown.childNodes[3].classList.toggle('hide');
        closeDropdown(dropdown.childNodes[3]);

    });
}

const homepageDownloadButton = () => {
    //Download button on image
    const downloadButton = document.querySelector('.download__button');
    gallery.addEventListener('click', e => {
        if(e.target.classList.contains('download__button')){
            const imageId = e.target.getAttribute('data-id');
            downloadImage(curr_images[imageId].regularImageUrl, imageId); //Downloads the image and saves it on local storage
        }
    });
}

//Displays random images fetched from api
const displayImages = (images) => {

    images.forEach(img => {
        curr_images[img.id] = {
			id: img.id,
            smallImageUrl: img.urls.small,
			regularImageUrl: img.urls.regular,
			fullImageUrl: img.urls.full,
            rawImageUrl: img.urls.raw
        };
        gallery.innerHTML += 
        `
            <div class="gallery-img">
                <img src="${img.urls.small}" data-id="${img.id}" class="gallery__image" alt="">
                <div class="user">
                    <div class="user__container">
                        <img src="${img.user.profile_image.large}" class="user__img" alt="">
                        <p class="user__name">${img.user.name}</p>
                    </div>
                    <img src="img/download.svg" class="download__button" alt="" data-id="${img.id}">
                </div>
            </div>
        `;
        //Enable download button functionality (onw shown on image hover)
        homepageDownloadButton();
    });
};

//Fetch images from api => Returns an array of images
const fetchImages = async () => {

    const response = await fetch(random_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    
    displayImages(data);
    if(!loader.classList.contains('hide')) loader.classList.add('hide');
}

const fetchSearchedImages = async() => {
    search_photo_url = `https://api.unsplash.com/search/photos/?client_id=${access_key}&query=${searchParam}&per_page=30&page=${page}`;

    //Show loader
    loader.classList.remove('hide');

    const response = await fetch(search_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    //If no image is fetched then show popup
    if(data.total === 0){
        const popup = document.querySelector('.search-failed-popup');
        popup.classList.remove('hide');
        setTimeout(() => {
            fetchImages(random_photo_url);
            popup.classList.add('hide');
        }, 2000);
        return;
    }
    
    displayImages(data.results);
    loader.classList.add('hide');
}

const callFetchSearchedImages = () => {    
    if (previousSearchParam === searchParam) return;
    else previousSearchParam = searchParam; 
    
    gallery.innerHTML = '';

    curr_images = {};
    fetchSearchedImages();
}
      
const loadSearchedImages = () => {
    const searchBox = document.querySelector('.search-box');
    searchBox.addEventListener('keyup', e => {
        
        if(e.key ==='Enter'){
            searchParam = e.target.value.trim();
            //Fetch images onlyy if input field is not empty
            if(searchParam != '')
                callFetchSearchedImages(searchParam);
            form.reset();
        }
    });
}

const submitButton = () => {
    const submit = document.querySelector('.search-btn');
    const searchBox = document.querySelector('.search-box');
    submit.addEventListener('click', () => {
        searchParam = searchBox.value.trim();
        if(searchParam != '')
            callFetchSearchedImages(searchParam);
        form.reset();
    });
}
 

const searchImage = async() => {
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        loadSearchedImages();
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

    gallery.addEventListener('click', e => {
        if(!e.target.classList.contains('download__button') ){ //If any image (Except download button image) is clicked -> Show popup
            const popup = document.querySelector('.image-popup');
            popup.classList.toggle('hide');

            if (!popup.classList.contains('hide')) {
                body.style.overflow = "hidden"; // Disable scroll
            }
            const image = popup.childNodes[5];
            const imageSource = e.target.getAttribute('src');
            const imageId = e.target.getAttribute('data-id');

            image.setAttribute('src', imageSource);
            console.log(curr_images);
            downloadButtonSetup(curr_images[imageId]);

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
    fetchImages()
        .catch(err => {
            alert(`Error loading images : ${err}`);
        });
}

fetchBackgroundImage();
// callApi();
// showPopup();
// searchImage();
// submitButton();