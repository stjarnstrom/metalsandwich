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
;(function(window) {

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
		// this.DOM.columns = {left: this.DOM.caption.querySelector('.column--left'), right: this.DOM.caption.querySelector('.column--right')};
	}

	StackFx.prototype._removeAnimeTargets = function() {
		anime.remove(this.DOM.stackItems);
		anime.remove(this.DOM.img);
		anime.remove(this.DOM.title);
		// anime.remove(this.DOM.columns.left);
		// anime.remove(this.DOM.columns.right);
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
		
		// anime({
		// 	targets: [this.DOM.columns.left, this.DOM.columns.right],
		// 	duration: 1000,
		// 	easing: 'easeOutElastic',
		// 	translateY: function(target, index) {
		// 		return index === 0 ? 30 : 20;
		// 	}
		// });
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

		// anime({
		// 	targets: [this.DOM.columns.left, this.DOM.columns.right, this.DOM.title],
		// 	duration: 500,
		// 	easing: 'easeOutExpo',
		// 	translateY: 0
		// });
	};

	window.AltairFx = AltairFx;

})(window);