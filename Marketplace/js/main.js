const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const more = document.querySelector('.more');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const showAcsessories = document.querySelectorAll('.show-acsessories');
const showClothing = document.querySelectorAll('.show-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const modalForm = document.querySelector('.modal-form');
const checkboxSwiper = document.querySelector('.checkbox');

const getGoods = async () => {
	const result = await fetch('db/db.json');
	if (!result.ok) {
		throw 'Ошибочка вышла: ' + result.status;
	}
	return await result.json();
};

const cart = {
	//cartGoods: [],
	//Для localStorage:
	cartGoods: JSON.parse(localStorage.getItem('cartWild')) || [],
	updateLocalStorage(){
		localStorage.setItem('cartWild',JSON.stringify(this.cartGoods));
	},
	getCountCartGoods(){
		return this.cartGoods.length;
	},
	countQuantity() {
		cartCount.textContent = this.cartGoods.reduce((sum, item) => {
			return sum + item.count;
		}, 0);
	},
	countEmpty(){
		if(cartCount.textContent == 0){
			cartCount.textContent = '';
		}
	},
	clearCart() {
		this.cartGoods.length = 0;
		this.countQuantity();
	},
	renderCards(){
		cartTableGoods.textContent ='';
		this.cartGoods.forEach(({ id, name, price, count})=> {
			const trGood = document.createElement('tr');
			trGood.className= 'cart-item';
			trGood.dataset.id = id;
			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price*count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice =this.cartGoods.reduce((sum, item)=>{
			return sum + item.price * item.count;
		}, 0);
		cardTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id!== item.id);
		this.countQuantity();
		this.countEmpty();
		this.updateLocalStorage();
		this.renderCards();
	},
	minusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				if(item.count <=1){
					this.deleteGood(id);
				}
				else{
					item.count--;
				}
				break;
			}
		}
		this.countQuantity();
		this.countEmpty();
		this.updateLocalStorage();
		this.renderCards();
	},
	plusGood(id){
		for(const item of this.cartGoods){
			if(item.id === id){
				item.count++;
				break;
			}
		}
		this.countQuantity();
		this.renderCards();
		this.renderCards();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem){
			this.plusGood(id);
		}
		else{
			getGoods()
				.then(data=> data.find(item => item.id === id))
				.then(({ id, name, price }) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1,
					});
					this.countQuantity();
					this.updateLocalStorage();
					this.renderCards();
				});
		}
	},
};

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	if(addToCart){
		cart.addCartGoods(addToCart.dataset.id);
	}
});
cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if(target.classList.contains('cart-btn-delete')){
		const parent = target.closest('.cart-item'); //ищем родителя с классом метод (closest) 
		cart.deleteGood(parent.dataset.id);
		//сокращаем код 
		//const id = target.closest('.cart-item').dataset.id; cart.deleteGood(id);
	}
	if(target.classList.contains('cart-btn-minus')){
		const parent = target.closest('.cart-item'); //ищем родителя с классом метод (closest) 
		cart.minusGood(parent.dataset.id);
		//сокращаем код 
		//const id = target.closest('.cart-item').dataset.id; cart.minusGood(id);
	}
	if(target.classList.contains('cart-btn-plus')){
		const parent = target.closest('.cart-item'); //ищем родителя с классом метод (closest) 
		cart.plusGood(parent.dataset.id);
		//сокращаем код 
		//const id = target.closest('.cart-item').dataset.id; cart.plusGood(id);
	}
});

const openModal = () => {
	cart.renderCards();
	modalCart.classList.add('show');
	document.body.style.overflow = "hidden";
};

const closeModal = () => {
	modalCart.classList.remove('show');
	document.body.style.overflow = "scroll";
};

buttonCart.addEventListener('click', openModal);

modalClose.addEventListener('click', closeModal);

modalCart.addEventListener('click', event => {
	const target = event.target;
	if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
		closeModal();
	}
});
// scroll smooth

{
	const scrollLinks = document.querySelectorAll('a.scroll-link');
	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			up();
		});
	}
}

const createCard = function (objCard) {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';
	const {
		label,
		name,
		img,
		description,
		id,
		price
	} = objCard; //либо перенести в аргументы 60 строчка за место objCard - ({label, name, img, description, id, price})
	card.innerHTML =
		`<div class="goods-card">
			${label ? `<span class="label">${label}</span>`: ''}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>`;
	return card;
};

const renderCards = function (data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	// cards.forEach(function(card){
	// 	longGoodsList.append(card);
	// });
	//Либо ниже через append( он распаковывает через запятую объект)
	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
};
const up = () => {
	let top = Math.max(document.body.scrollTop,document.documentElement.scrollTop);
	let t;
	if(top > 0) {
		window.scrollBy(0,-100);
		t = setTimeout('up()',10);
	} else clearTimeout(t);
	return false;
}
more.addEventListener('click', function (e) {
	e.preventDefault();
	getGoods().then(renderCards).then(up);
});

const filterPriceCards = function (data) {
	if(checkboxSwiper.checked){
		return data.sort((a,b)=> b.price - a.price);
	}
	else{
		return data.sort((a,b)=> a.price - b.price);
	}
}; //Фильтрация карточек по возростанию цены товара

const filterCards = function (field, value) {
	getGoods()
		.then(data => data.filter(good => good[field] === value)) //при совпадении true (и добавление карточки) false = пропустить
		.then(filterPriceCards)
		.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', e => {
		e.preventDefault();
		if (link.hasAttribute('data-field')) {
			const field = link.dataset.field;
			const value = link.textContent;
			filterCards(field, value);
		}
		// Для вкладки ALL
		else {
			getGoods().then(filterPriceCards).then(renderCards);
		}
	});
});

const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser,
});

const validForm = (formData) =>{
	let valid = false;
	for(const [, value] of formData){
		if(value.trim()){
			valid = true;
		}
		else{
			valid = false;
			break;
		}
	}
	return valid
}

modalForm.addEventListener('submit', event =>{
	event.preventDefault();
	const formData = new FormData(modalForm);

	if(validForm(formData) && cart.getCountCartGoods()){
		formData.append('cart', JSON.stringify(cart.cartGoods));

		postData(formData)
		.then(response => {
			if(!response.ok) {
				throw new Error(respons.status);
			}
			alert('Ваш заказ отправлен, с вами свяжутся в ближайшее время');
		})
		.catch(err=> {
			alert('К сожалению произошла ошибка, повторите попытку позже');
		})
		.finally(()=>{
			closeModal();
			modalForm.reset();
			cart.cartGoods.length = 0;
		});
	}
	else{
		if(!cart.getCountCartGoods()){
			alert('Добавьте товары в корзину');
		}
		if(!validForm(formData)){
			alert('Заполните поля правильно');
		}
	}
});

const deadline = '2021-05-20';
const getTimeRemaining = function(endtime) {
	const t = Date.parse(endtime) - Date.parse(new Date()),
				days = Math.floor(t / (1000 * 60 * 60 * 24)),
				hours = Math.floor((t/ (1000 * 60 * 60) % 24)),
				minutes = Math.floor((t/ 1000 / 60) % 60),
				seconds = Math.floor((t/ 1000) % 60);
		
		return {
			'total': t,
			'days': days,
			'hours': hours,
			'minutes': minutes,
			'seconds': seconds
		};
}

const getZero = function(num){
	if(num>=0 && num < 10){
		return `0${num}`;
	}
	else{
		return num;
	}
}

const setClock = function(selector, endtime) {
	const timer = document.querySelector(selector),
				days = timer.querySelector('#days'),
				hours = timer.querySelector('#hours'),
				minutes = timer.querySelector('#minutes'),
				seconds = timer.querySelector('#seconds'),
				timeInterval = setInterval(updateClock, 1000);

		updateClock();

	function updateClock(){
		const t = getTimeRemaining(endtime);
		days.innerHTML = getZero(t.days);
		hours.innerHTML = getZero(t.hours);
		minutes.innerHTML = getZero(t.minutes);
		seconds.innerHTML = getZero(t.seconds);

		if(t.total <= 0){
			clearInterval(timeInterval);
		}
	}
}
setClock('.timer', deadline);