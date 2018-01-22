/* global anime:true */
/* global imagesLoaded:true */
/* global Promise:true */

/**
 * render class
 */
{
	setTimeout(() => document.body.classList.add('render'), 60);
	const navdemos = Array.from(document.querySelectorAll('nav.demos > .demo'));
	const navigate = (linkEl) => {
		document.body.classList.remove('render');
		document.body.addEventListener('transitionend', () => window.location = linkEl.href);
	};
	navdemos.forEach(link => link.addEventListener('click', (ev) => {
		ev.preventDefault();
		navigate(ev.target);
	}));
}

/* 
 * Display Chapter selection
*/

class ChapterSelection {
    constructor(el) {
        this.DOM = {};
        this.DOM.el = el;
        this.DOM.slideshow = document.body.querySelector('.slideshow');

        this.init();
    }
    init() {
        this.DOM.el.addEventListener('click', () => this.toggleChapterSelection());
        this.DOM.slideshow.addEventListener('click', () => this.closeChapterSelection());
    }
    toggleChapterSelection() {
        document.body.classList.toggle('chapter-selection-active')
    }
    closeChapterSelection() {
        if (document.body.classList.contains('chapter-selection-active'))
            document.body.classList.remove('chapter-selection-active')
    }
}

window.ChapterSelection = new ChapterSelection(document.querySelector('.chapter-selection'));



/**
 * Slideshow code
 * Inspired by http://www.codrops.com
 */

// From https://davidwalsh.name/javascript-debounce-function.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

class Slideshow {
    constructor(el) {
        this.DOM = {};
        this.DOM.el = el;
        this.settings = {
            animation: {
                slides: {
                    duration: 500,
                    easing: 'easeOutQuint'
                },
                shape: {
                    duration: 300,
                    easing: {in: 'easeOutQuint', out: 'easeOutQuad'}
                }
            },
            frameFill: 'url(#gradient1)'
        }
        this.init();
    }
    init() {
        this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides--images > .slide'));
        this.slidesTotal = this.DOM.slides.length;
        this.DOM.nav = this.DOM.el.querySelector('.slidenav');
        this.DOM.titles = this.DOM.el.querySelector('.slides--titles');
        this.DOM.titlesSlides = Array.from(this.DOM.titles.querySelectorAll('.slide'));
        this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav__item--next');
        this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav__item--prev');
        this.DOM.backMenu = this.DOM.el.querySelector('.back');
        this.current = 0;
        this.createFrame(); 
        this.initEvents();

        window.currentSlide = 0;        
    }
    createFrame() {
        this.rect = this.DOM.el.getBoundingClientRect();
        this.frameSize = this.rect.width/12;
        this.paths = {
            initial: this.calculatePath('initial'),
            final: this.calculatePath('final')
        };
        this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.DOM.svg.setAttribute('class', 'shape');
        this.DOM.svg.setAttribute('width','100%');
        this.DOM.svg.setAttribute('height','100%');
        this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
        this.DOM.svg.innerHTML = `
        <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#09012d"/>
            <stop offset="100%" stop-color="#0f2b73"/>
        </linearGradient>
        </defs>
        <path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
        this.DOM.el.insertBefore(this.DOM.svg, this.DOM.titles);
        this.DOM.shape = this.DOM.svg.querySelector('path');
    }
    updateFrame() {
        this.paths.initial = this.calculatePath('initial');
        this.paths.final = this.calculatePath('final');
        this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
        this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
    }
    calculatePath(path = 'initial') {

        if ( path === 'initial' ) {
            return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
        }
        else {
            const point1 = {x: this.rect.width/4-50, y: this.rect.height/4+50};
            const point2 = {x: this.rect.width/4+50, y: this.rect.height/4-50};
            const point3 = {x: this.rect.width-point2.x, y: this.rect.height-point2.y};
            const point4 = {x: this.rect.width-point1.x, y: this.rect.height-point1.y};

            return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${point1.x},${point1.y} ${point2.x},${point2.y} ${point4.x},${point4.y} ${point3.x},${point3.y} Z`;
        }
    }
    initEvents() {
        this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
        this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
        this.DOM.backMenu.addEventListener('click', (ev) => { 
            var number = ev.toElement.getAttribute("data-slideindex");
            if (number !== null) this.navigateDirectlyTo(number);
        });
        
        window.addEventListener('resize', debounce(() => {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.updateFrame();
        }, 20));
        
        document.addEventListener('keydown', (ev) => {
            const keyCode = ev.keyCode || ev.which;
            if ( keyCode === 37 ) {
                this.navigate('prev');
            }
            else if ( keyCode === 39 ) {
                this.navigate('next');
            }

            if (document.body.classList.contains('chapter-selection-active'))
                document.body.classList.remove('chapter-selection-active')

        });
    }
    /* direct */
    navigateDirectlyTo(number = 0) {
        if ( this.isAnimating ) return false;
        this.isAnimating = true;

        var SlideNavigation = new CustomEvent('slideNavigation', {'detail': {'number': number} });
        document.dispatchEvent(SlideNavigation);

        const animateShapeIn = anime({
            targets: this.DOM.shape,
            duration: this.settings.animation.shape.duration,
            easing: this.settings.animation.shape.easing.in,
            d: this.paths.final
        });

        const animateSlides = () => {
            return new Promise((resolve) => {
                const currentSlide = this.DOM.slides[this.current];
                anime({
                    targets: currentSlide,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    //translateY: dir === 'next' ? this.rect.height : -1*this.rect.height,
                    translateY: (number > this.current) ? this.rect.height : -1*this.rect.height,
                    complete: () => {
                        currentSlide.classList.remove('slide--current');
                        resolve();
                    }
                });

                const currentTitleSlide = this.DOM.titlesSlides[this.current];
                anime({
                    targets: currentTitleSlide.children,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    // delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                    // translateY: [0, dir === 'next' ? 100 : -100],
                    delay: (t,i,total) => (number > this.current) ? i*100 : (total-i-1)*100,
                    translateY: [0, (number > this.current) ? 100 : -100],
                    opacity: [1,0],
                    complete: () => {
                        currentTitleSlide.classList.remove('slide--current');
                        resolve();
                    }
                });

                this.current = this.current + (number - this.current); // variance

                const newSlide = this.DOM.slides[this.current];
                newSlide.classList.add('slide--current');
                anime({
                    targets: newSlide,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    // translateY: [dir === 'next' ? -1*this.rect.height : this.rect.height,0]
                    translateY: [(number > this.current) ? -1*this.rect.height : this.rect.height,0]
                });
    
                const newSlideImg = newSlide.querySelector('.slide__img');
                
                anime.remove(newSlideImg);
                anime({
                    targets: newSlideImg,
                    duration: this.settings.animation.slides.duration*3,
                    easing: this.settings.animation.slides.easing,
                    //translateY: [dir === 'next' ? -100 : 100, 0],
                    translateY: [(number > this.current) ? -100 : 100, 0],
                    scale: [0.2,1]
                });
                
                const newTitleSlide = this.DOM.titlesSlides[this.current];
                newTitleSlide.classList.add('slide--current');
                anime({
                    targets: newTitleSlide.children,
                    duration: this.settings.animation.slides.duration*1.5,
                    easing: this.settings.animation.slides.easing,
                    //delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                    //translateY: [dir === 'next' ? -100 : 100 ,0],
                    delay: (t,i,total) => (number > this.current) ? i*100+100 : (total-i-1)*100+100,
                    translateY: [(number > this.current) ? -100 : 100 ,0],
                    opacity: [0,1]
                });
            });
        };

        const animateShapeOut = () => {
            anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.out,
                d: this.paths.initial,
                complete: () => this.isAnimating = false
            });
        }

        animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
    }

    navigate(dir = 'next') {
        if ( this.isAnimating ) return false;
        this.isAnimating = true;

        var SlideNavigation = new CustomEvent('slideNavigation', {'detail': {'direction': dir} }); // a okay
        document.dispatchEvent(SlideNavigation);

        const animateShapeIn = anime({
            targets: this.DOM.shape,
            duration: this.settings.animation.shape.duration,
            easing: this.settings.animation.shape.easing.in,
            d: this.paths.final
        });

        const animateSlides = () => {
            return new Promise((resolve) => {
                const currentSlide = this.DOM.slides[this.current];
                anime({
                    targets: currentSlide,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    translateY: dir === 'next' ? this.rect.height : -1*this.rect.height,
                    complete: () => {
                        currentSlide.classList.remove('slide--current');
                        resolve();
                    }
                });

                const currentTitleSlide = this.DOM.titlesSlides[this.current];
                anime({
                    targets: currentTitleSlide.children,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    delay: (t,i,total) => dir === 'next' ? i*100 : (total-i-1)*100,
                    translateY: [0, dir === 'next' ? 100 : -100],
                    opacity: [1,0],
                    complete: () => {
                        currentTitleSlide.classList.remove('slide--current');
                        resolve();
                    }
                });
    
                this.current = dir === 'next' ? 
                    this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                    this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                
                const newSlide = this.DOM.slides[this.current];
                newSlide.classList.add('slide--current');
                anime({
                    targets: newSlide,
                    duration: this.settings.animation.slides.duration,
                    easing: this.settings.animation.slides.easing,
                    translateY: [dir === 'next' ? -1*this.rect.height : this.rect.height,0]
                });
    
                const newSlideImg = newSlide.querySelector('.slide__img');
                
                anime.remove(newSlideImg);
                anime({
                    targets: newSlideImg,
                    duration: this.settings.animation.slides.duration*3,
                    easing: this.settings.animation.slides.easing,
                    translateY: [dir === 'next' ? -100 : 100, 0],
                    scale: [0.2,1]
                });
                
                const newTitleSlide = this.DOM.titlesSlides[this.current];
                newTitleSlide.classList.add('slide--current');
                anime({
                    targets: newTitleSlide.children,
                    duration: this.settings.animation.slides.duration*1.5,
                    easing: this.settings.animation.slides.easing,
                    delay: (t,i,total) => dir === 'next' ? i*100+100 : (total-i-1)*100+100,
                    translateY: [dir === 'next' ? -100 : 100 ,0],
                    opacity: [0,1]
                });
            });
        };

        const animateShapeOut = () => {
            anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.out,
                d: this.paths.initial,
                complete: () => this.isAnimating = false
            });
        }

        animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
    }
}


var MenuStep = function(ev) {
    var dir = ev.detail.direction;
    var number = ev.detail.number;

    //if (dir == undefined) return; 

    var numSlides = document.getElementById("slide--backgrounds").childElementCount;

    if (dir == "next") {
        window.currentSlide++;
        window.currentSlide = window.currentSlide % (numSlides);
    } else if (number !== undefined) {
        window.currentSlide = number;
    } else {
        window.currentSlide--;
        if (window.currentSlide < 0) 
            window.currentSlide = numSlides + window.currentSlide;
    }

    // console.log('current slide: ' + window.currentSlide);
    // console.log('direction: ' + dir);
    // console.log('number of slides: ' + numSlides);

    var slides = document.getElementById("slide--navigation").childNodes;
    var currentStep = 0;

    [].forEach.call(slides, function(el) {					
        if (el.classList) {
            if (currentStep++ == window.currentSlide) {
                el.classList.add("active");							
            } else {
                el.classList.remove("active");
            }
        }
    });

};

// demon.init())

window.Slideshow = new Slideshow(document.querySelector('.slideshow'));
imagesLoaded('.slide__img', { background: true }, () => document.body.classList.remove('loading'));

document.addEventListener('slideNavigation', MenuStep );




/* stacks */

/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
(function(window) {

	'use strict';

	/**
	 * StackFx: The parent class.
	 */
	function StackFx(el) {
		this.DOM = {};
		this.DOM.el = el;
		this.DOM.stack = this.DOM.el.querySelector('.stack');
		this.DOM.stackItems = [].slice.call(this.DOM.stack.children);
		this.totalItems = this.DOM.stackItems.length;
		this.DOM.img = this.DOM.stack.querySelector('.stack__figure > .stack__img');
		this.DOM.caption = this.DOM.el.querySelector('.grid__item-caption');
		this.DOM.title = this.DOM.caption.querySelector('.grid__item-title');
	}

	StackFx.prototype._removeAnimeTargets = function() {
		anime.remove(this.DOM.stackItems);
		anime.remove(this.DOM.img);
		anime.remove(this.DOM.title);
	};

	/************************************************************************
	 * AltairFx.
	 ************************************************************************/
	function AltairFx(el) {
		StackFx.call(this, el);
		this._initEvents();
	}

	AltairFx.prototype = Object.create(StackFx.prototype);
	AltairFx.prototype.constructor = AltairFx;

	AltairFx.prototype._initEvents = function() {
		var self = this;
		this._mouseenterFn = function() {
			self._removeAnimeTargets();
			self._in();
		};
		this._mouseleaveFn = function() {
			self._removeAnimeTargets();
			self._out();
		};
		this.DOM.stack.addEventListener('mouseenter', this._mouseenterFn);
		this.DOM.stack.addEventListener('mouseleave', this._mouseleaveFn);
	};

	AltairFx.prototype._in = function() {
		var self = this;

		this.DOM.stackItems.map(function(e, i) {
			e.style.opacity = i !== self.totalItems - 1 ? 0.2*i+0.2 : 1
		});

		anime({
			targets: this.DOM.stackItems,
			duration: 1000,
			easing: 'easeOutElastic',
			translateZ: function(target, index, cnt) {
				return index*3;
			},
			rotateX: function(target, index, cnt) {
				return -1*index*4;
			},
			delay: function(target, index, cnt) {
				return (cnt-index-1)*30
			}
		});
		
		anime({
			targets: this.DOM.img,
			duration: 500,
			easing: 'easeOutExpo',
			scale: 0.7
		});

		anime({
			targets: this.DOM.title,
			duration: 1000,
			easing: 'easeOutElastic',
			translateY: 20
		});		
	};

	AltairFx.prototype._out = function() {
		var self = this;

		anime({
			targets: this.DOM.stackItems,
			duration: 500,
			easing: 'easeOutExpo',
			opacity: function(target, index, cnt) {
				return index !== cnt - 1 ? 0 : 1
			},
			translateZ: 0,
			rotateX: 0
		});

		anime({
			targets: this.DOM.img,
			duration: 500,
			easing: 'easeOutExpo',
			scale: 1
		});

		anime({
			targets: [this.DOM.title],
			duration: 500,
			easing: 'easeOutExpo',
			translateY: 0
		});
	};

	window.AltairFx = AltairFx;


})(window);

(function() {
    [].slice.call(document.querySelectorAll('.grid--effect-altair > .grid__item')).forEach(function(stackEl) {
        new AltairFx(stackEl);
    });
})();