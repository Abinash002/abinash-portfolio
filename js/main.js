(function ($) {
	"use strict";

/*=============================================
	=    		 Preloader			      =
=============================================*/
function preloader() {
	$('#preloader').delay(0).fadeOut();
};

$(window).on('load', function () {
	preloader();
	wowAnimation();
});



/*=============================================
	=    		Mobile Menu			      =
=============================================*/
//SubMenu Dropdown Toggle
if ($('.menu__area li.menu-item-has-children ul').length) {
	$('.menu__area .navigation li.menu-item-has-children').append('<div class="dropdown__btn"><span class="fas fa-angle-down"></span></div>');

}

//Mobile Nav Hide Show
if ($('.mobile__menu').length) {

	var mobileMenuContent = $('.menu__area .main__menu').html();
	$('.mobile__menu .menu__box .menu__outer').append(mobileMenuContent);

	//Dropdown Button
	$('.mobile__menu li.menu-item-has-children .dropdown__btn').on('click', function () {
		$(this).toggleClass('open');
		$(this).prev('ul').slideToggle(500);
	});
	//Menu Toggle Btn
	$('.mobile__nav__toggler').on('click', function () {
		$('body').addClass('mobile-menu-visible');
	});

	//Menu Toggle Btn
	$('.menu__backdrop, .mobile__menu .close__btn').on('click', function () {
		$('body').removeClass('mobile-menu-visible');
	});
}



/*=============================================
	=     Menu sticky & Scroll to top      =
=============================================*/
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 245) {
		$("#sticky-header").removeClass("sticky-menu");
		$('.scroll-to-target').removeClass('open');

	} else {
		$("#sticky-header").addClass("sticky-menu");
		$('.scroll-to-target').addClass('open');
	}
});


/*=============================================
	=    		 Scroll Up & Smooth Scroll	     =
	= Handled by assets/js/smooth-scroll.js      =
=============================================*/



/*=============================================
	=    		 Tab Switcher		      =
=============================================*/
$(".mode__switcher, .switcher__tab__btn, .theme-switcher-btn").on("click", function (e) {
	e.preventDefault();
	if (window.PortfolioTheme && typeof window.PortfolioTheme.toggle === 'function') {
		window.PortfolioTheme.toggle();
	} else {
		$(".mode__switcher").toggleClass("active");
		$('body').toggleClass("active-dark-mode");
	}
});


/*=============================================
	=    		Brand Active		      =
=============================================*/
$('.brand-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
	arrows: false,
	slidesToShow: 6,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Services Active		      =
=============================================*/
$('.services__active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
	arrows: true,
	slidesToShow: 4,
	slidesToScroll: 1,
	prevArrow: '<button class="slick-prev"><i class="far fa-long-arrow-left"></i></button>',
	nextArrow: '<button class="slick-next"><i class="far fa-long-arrow-right"></i></button>',
	appendArrows: ".services__arrow",
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				autoplay: true,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Portfolio Active		      =
=============================================*/
var $portfolioSlider = $('.portfolio__active');

// Function to update active/blur states on all slides
function updatePortfolioBlur($slider) {
	$slider.find('.slick-slide').each(function () {
		var $slide = $(this);
		if ($slide.hasClass('slick-current') && $slide.hasClass('slick-active')) {
			$slide.removeClass('slick-blur').addClass('slick-focus');
		} else {
			$slide.removeClass('slick-focus').addClass('slick-blur');
		}
	});
}

// Bind init event before slick initialization
$portfolioSlider.on('init', function (event, slick) {
	updatePortfolioBlur($(this));
});

$portfolioSlider.slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
	arrows: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	prevArrow: '<button class="slick-prev"><i class="far fa-long-arrow-alt-left"></i></button>',
	nextArrow: '<button class="slick-next"><i class="far fa-long-arrow-alt-right"></i></button>',
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});

// Run initial blur update for all slider instances
$portfolioSlider.each(function () {
	updatePortfolioBlur($(this));
});

// Update slide blur/active state on slide transitions using jQuery
$portfolioSlider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
	var $slider = $(this);
	$slider.find('.slick-slide').removeClass('slick-focus').addClass('slick-blur');

	// Target incoming slide (including cloned slides in infinite mode)
	var $next = $slider.find('.slick-slide[data-slick-index="' + nextSlide + '"]');
	if (slick.options.infinite) {
		if (currentSlide === slick.slideCount - 1 && nextSlide === 0) {
			$next = $next.add($slider.find('.slick-slide[data-slick-index="' + slick.slideCount + '"]'));
		} else if (currentSlide === 0 && nextSlide === slick.slideCount - 1) {
			$next = $next.add($slider.find('.slick-slide[data-slick-index="-1"]'));
		}
	}
	$next.removeClass('slick-blur').addClass('slick-focus');
});

$portfolioSlider.on('afterChange', function (event, slick, currentSlide) {
	updatePortfolioBlur($(this));
});

// Optional: Clicking a side slide directly slides it into the center without opening link
$portfolioSlider.on('click', '.slick-slide:not(.slick-current)', function (e) {
	e.preventDefault();
	var index = $(this).data('slick-index');
	if (index !== undefined) {
		$(this).closest('.portfolio__active').slick('slickGoTo', index);
	}
});

$('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(this).attr('data-bs-target') || $(this).attr('href');
	function refreshVisibleSlider() {
		if (target) {
			var $slider = $(target).find('.portfolio__active');
			if ($slider.length && $slider.hasClass('slick-initialized')) {
				$slider.slick('setPosition');
				updatePortfolioBlur($slider);
			}
		}
		$('.portfolio__active:visible').each(function () {
			if ($(this).hasClass('slick-initialized')) {
				$(this).slick('setPosition');
				updatePortfolioBlur($(this));
			}
		});
	}
	refreshVisibleSlider();
	setTimeout(refreshVisibleSlider, 60);
});


/*=============================================
	=         Testimonial Active          =
=============================================*/
$('.testimonial__active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
	arrows: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	prevArrow: '<button class="slick-prev"><i class="far fa-long-arrow-left"></i></button>',
	nextArrow: '<button class="slick-next"><i class="far fa-long-arrow-right"></i></button>',
	appendArrows: ".testimonial__arrow",
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
	]
});


/*=============================================
	=         Testimonial Active          =
=============================================*/
$('.testimonial__two__active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
	arrows: true,
	fade: true,
	slidesToShow: 1,
	slidesToScroll: 1,
	prevArrow: '<button class="slick-prev"><i class="far fa-long-arrow-left"></i></button>',
	nextArrow: '<button class="slick-next"><i class="far fa-long-arrow-right"></i></button>',
	appendArrows: ".testimonial__arrow",
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
	]
});


/*=============================================
	=    		Magnific Popup		      =
=============================================*/
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
		enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


/*=============================================
	=    		Isotope	Active  	      =
=============================================*/
$('.portfolio__inner__active').imagesLoaded(function () {
	// init Isotope
	var $grid = $('.portfolio__inner__active').isotope({
		itemSelector: '.grid-item',
		percentPosition: true,
		transitionDuration: '0.6s',
		masonry: {
			columnWidth: 1,
		}
	});
	// filter items on button click
	$('.portfolio__inner__nav').on('click', 'button', function () {
		var filterValue = $(this).attr('data-filter');
		$grid.isotope({ filter: filterValue });
	});

});
//for menu active class
$('.portfolio__inner__nav button').on('click', function (event) {
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
	event.preventDefault();
});


/*=============================================
	=    		 Wow Active  	         =
=============================================*/
function wowAnimation() {
	var wow = new WOW({
		boxClass: 'wow',
		animateClass: 'animated',
		offset: 0,
		mobile: false,
		live: true
	});
	wow.init();
}


})(jQuery);