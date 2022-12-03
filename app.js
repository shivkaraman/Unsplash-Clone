
let access_key = 'cdmxIhg05mRY575-Gf_0DxqRpogA4DVLOGpBZ6odWBs';

let searchParam=``, previousSearchParam, search = false, page = 1, zoomed = false;
let curr_images = {}, fetchMore = false;

const random_photo_url = `https://api.unsplash.com/photos/random?client_id=${access_key}&count=20`;

const gallery = document.querySelector('.gallery');
const body = document.querySelector('body');
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
const downloadImage = async (imageId, width, height) => {
    img = curr_images[imageId];

	//fetch the image url
	const response = await fetch(`${curr_images[imageId]['downloadLink']}&client_id=${access_key}`);
	const res = await response.json()

	//compute the final url
	//check importance of dl parameter https://docs.imgix.com/apis/rendering/format/dl
	const imageSrc = `${res.url}&w=${width}&h=${height}&dl=unsplash-image-${imageId}.jpg`;

	//download the url
	const link = document.createElement('a');
	link.href = imageSrc;
	link.click();

	//remove the link element
	link.remove();
}


//Download image and dropdown on image popup
const downloadButtonSetup = img => {
    const download = document.querySelector('.download');
    const smallWidth = 640;
	const smallHeight = Math.floor((img.height / img.width) * smallWidth);
	const mediumWidth = 1920;
	const mediumHeight = Math.floor((img.height / img.width) * mediumWidth);
	const largeWidth = 2400;
	const largeHeight = Math.floor((img.height / img.width) * largeWidth);

    const downloadHTML = 
        `<span class="download__btn" onclick="downloadImage('${img.id}', '${img.width}', '${img.height})')"> Download </span>
        <div class="dropdown">
            <span class="download__dropdown__arrow">
                <img src="./img/downArrow.png" alt="down-arrow icon" class="download__dropdown__arrow__img"/>
            </span>
            <div class="dropdown__content hide">
                <span onclick="downloadImage('${img.id}', '${smallWidth}', '${smallHeight})')"> Small (${smallWidth}x${smallHeight})</span>
                <span onclick="downloadImage('${img.id}', '${mediumWidth}', '${mediumHeight})')"> Medium (${mediumWidth}x${mediumHeight})</span>
                <span onclick="downloadImage('${img.id}', '${largeWidth}', '${largeHeight})')"> Large (${largeWidth}x${largeHeight})</span>
                <hr />
                <span onclick="downloadImage('${img.id}', '${img.width}', '${img.height})')"> Original Size (${img.width}x${img.height})</span>
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
    gallery.addEventListener('click', e => {
        if(e.target.classList.contains('download__button')){
            e.stopPropagation();
            const imageId = e.target.getAttribute('data-id');
            downloadImage(imageId, curr_images[imageId].width, curr_images[imageId].height); //Downloads the image and saves it on local storage
        }
    });
}

//Displays random images fetched from api
const displayImages = (images) => {
    let newImages = '';

    images.forEach(img => {
        curr_images[img.id] = {
			id: img.id,
            smallImageUrl: img.urls.small,
			regularImageUrl: img.urls.regular,
			fullImageUrl: img.urls.full,
            rawImageUrl: img.urls.raw,
            height: img.height,
			width: img.width,
            downloadLink: img.links.download_location
        };
        newImages += 
        `
            <div class="gallery-img">
                <img src="${img.urls.full}" data-id="${img.id}" class="gallery__image" alt="" loading="lazy">
                <div class="user">
                    <div class="user__container">
                        <img src="${img.user.profile_image.large}" class="user__img" alt="">
                        <p class="user__name">${img.user.name}</p>
                    </div>
                    <img src="img/download.svg" class="download__button" alt="" data-id="${img.id}">
                </div>
            </div>
        `;
    });
    gallery.innerHTML += newImages;
    fetchMore = true;
    //Enable download button functionality (onw shown on image hover)
    homepageDownloadButton();
};

//Fetch images from api => Returns an array of images
const fetchImages = async () => {

    const response = await fetch(random_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    
    displayImages(data);
}

const callApi = () => {
    fetchImages()
        .catch(err => {
            alert(`Error loading images : ${err}`);
        });
}

const fetchSearchedImages = async() => {
    page++;
    search_photo_url = `https://api.unsplash.com/search/photos/?client_id=${access_key}&query=${searchParam}&per_page=20&page=${page}`;

    const response = await fetch(search_photo_url);
    if(response.status !== 200){
        throw new Error(response.status);
    }
    const data = await response.json();
    //If no image is fetched then show popup
    if(data.total === 0){
        const popup = document.querySelector('.search-failed-popup');
        search = false;
        popup.classList.remove('hide');
        setTimeout(() => {
            callApi();
            popup.classList.add('hide');
        }, 2000);
        return;
    }

    displayImages(data.results);
}

const fetchSearched = () => {
    fetchSearchedImages()
        .catch(err => {
            alert(`Error loading images : ${err}`);
        });
}

const checkAndFetch = () => {    
    if (previousSearchParam === searchParam) return;
    else previousSearchParam = searchParam; 
    
    gallery.innerHTML = '';

    curr_images = {};
    
    fetchMore = false;
    fetchSearched();
}
      
const loadSearchedImages = () => {
    const searchBox = document.querySelector('.search-box');
    searchBox.addEventListener('keyup', e => {
        
        if(e.key ==='Enter'){
            searchParam = e.target.value.trim();
            if(searchParam !== '')
                checkAndFetch(searchParam);
        }
    });
}

const submitButton = () => {
    const submit = document.querySelector('.search-btn');
    const searchBox = document.querySelector('.search-box');
    submit.addEventListener('click', () => {
        searchParam = searchBox.value.trim();
        search = true;
        if(searchParam !== '')
            checkAndFetch(searchParam);
    });
}
 

const searchImage = async() => {
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        search = true;
        loadSearchedImages();
    });
}

 const zoomImgFunc = image => {
    const zoomIcon = image.parentElement.querySelector('span');
    if(zoomed == false){
        zoomed = true;
        image.classList.remove('not-zoomed');
        image.classList.add('zoomed');
        zoomIcon.classList.remove('not-zoomed');
        console.log('logo removed');
    }
    else{
        zoomed = false;
        image.classList.remove('zoomed');
        image.classList.add('not-zoomed');
        zoomIcon.classList.add('not-zoomed');
        console.log('logo added');
    }
 }

 const helperFunc = e => {
    if(e.target.classList.contains('large-img') || e.target.classList.contains('not-zoomed')){
        e.stopPropagation();
        image = e.target.parentElement.querySelector('.large-img');
        zoomImgFunc(image);
    }
 }

const zoomImage = (imgContainer) => {
    imgContainer.addEventListener('click', helperFunc, false);
}

const closePopup = popup => {
    document.addEventListener('click', e => {
        if(e.target.classList.contains('close-btn') || e.target.closest('.header-section')){
            e.stopPropagation();

            //Default zoom to NOT-ZOOMED and remove event listener
            const imgContainer = popup.querySelector('.large-img').parentElement;
            zoomed = true;
            zoomImgFunc(popup.querySelector('.large-img'));
            imgContainer.removeEventListener('click', helperFunc, false);
            
            //Close popup and enable scroll
            popup.classList.add('hide');
            body.style.overflow = 'auto';   // Enable scroll
        }
    });
}

const showPopup = () => {

    gallery.addEventListener('click', e => {
        //If any image (Except download button image) is clicked -> Show popup
        if(!e.target.classList.contains('download__button') ){
            e.stopPropagation();
            console.log('image clicked');
            const popup = document.querySelector('.image-popup');
            popup.classList.toggle('hide');

            if (!popup.classList.contains('hide')) {
                body.style.overflow = "hidden"; // Disable scroll
            }
            
            const image = popup.querySelector('.large-img');
            const imageSource = e.target.getAttribute('src');
            const imageId = e.target.getAttribute('data-id');

            image.setAttribute('src', imageSource);
            downloadButtonSetup(curr_images[imageId]);
            zoomImage(image.parentElement);
        
            if (!popup.classList.contains('hide')) {
                closePopup(popup);
            }
            else{
                body.style.overflow = 'auto'; 
            }
        }
    });
}

const fetchInfiniteImages = () => {
	let options = {
		root: null,         //Tells which element we want to use as viewport for intersection observer(null => whole webpage(ie curr viewport))
		rootMargin: '0px',  //Area of viewport on which intersection observer watches for intersection of elements 
		threshold: 0.1      //represents the distance an element has intersected into or crossed over in the root
	}

	let observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			console.log('intersecting')
            fetchMore && (search ?  fetchSearched() : callApi());
            fetchMore = false;
		} else {
			console.log('not Intersecting')
		}
	}, options);

    const loader = document.querySelector('.flexbox');
	observer.observe(loader);
}

fetchBackgroundImage();
callApi();
fetchInfiniteImages();
showPopup();
searchImage();
submitButton();