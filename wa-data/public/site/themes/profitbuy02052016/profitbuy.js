// variable for event touch data
var UserTouch = ( function() {

    var min_touch_length = 5,
        touch_is_vertical,
        finger_place_x_start,
        finger_place_y_start,
        finger_place_x_end,
        finger_place_y_end,
        touch_delta_x,
        touch_delta_y,
        time_start,
        time_end,
        element;

    var on_touch_start = function(event) {

        finger_place_x_start = event.touches[0].pageX;
        finger_place_y_start = event.touches[0].pageY;
        finger_place_x_end = null;
        finger_place_y_end = null;
        touch_delta_x = null;
        touch_delta_y = null;
        touch_is_vertical = false,
            time_start = ( new Date() ).getTime(),
            time_end = false;

        UserTouch = {
            offsetStart: {
                top: finger_place_y_start,
                left: finger_place_x_start
            },
            offsetEnd: {
                top: false,
                left: false
            },
            offsetDelta: {
                x: false,
                y: false
            },
            orientation: {
                x: false,
                y: false
            },
            touchTime: false
        };

        element.addEventListener("touchmove", on_touch_move, false);
        element.addEventListener("touchend", on_touch_end, false);
    };

    var on_touch_move = function(event) {
        time_end = (new Date()).getTime();
        finger_place_x_end = event.touches[0].pageX;
        finger_place_y_end = event.touches[0].pageY;
        touch_delta_x = finger_place_x_end - finger_place_x_start;
        touch_delta_y = finger_place_y_end - finger_place_y_start;

        var is_horizontal = ( Math.abs(touch_delta_x) > Math.abs(touch_delta_y) && Math.abs(touch_delta_x) > min_touch_length );
        if (is_horizontal) {
            event.preventDefault();
        }

        UserTouch.offsetEnd = {
            top: finger_place_y_end,
            left: finger_place_x_end
        };

        UserTouch.offsetDelta = {
            x: touch_delta_x,
            y: touch_delta_y
        };

        if ( Math.abs(touch_delta_y) > min_touch_length ) {
            if ( touch_delta_y < 0 ) {
                UserTouch.orientation.y = "top";
            } else {
                UserTouch.orientation.y = "bottom";
            }
        }

        if ( Math.abs(touch_delta_x) > min_touch_length ) {
            if ( touch_delta_x < 0 ) {
                UserTouch.orientation.x = "left";
            } else {
                UserTouch.orientation.x = "right";
            }
        }

        UserTouch.touchTime = (time_end - time_start);
    };

    var on_touch_end = function() {
        // отключаем обработчики
        element.removeEventListener("touchmove", on_touch_move);
        element.removeEventListener("touchend", on_touch_end);
    };

    var bindEvents = function() {
        element = document.body;
        element.addEventListener("touchstart", on_touch_start, false);
    };

    document.addEventListener("DOMContentLoaded", function() {
        bindEvents();
    });

    return {
        offsetStart: {
            top: false,
            left: false
        },
        offsetEnd: {
            top: false,
            left: false
        },
        offsetDelta: {
            x: false,
            y: false
        },
        orientation: {
            x: false,
            y: false
        },
        touchTime: false
    };

})();

// Mobile Menu JS
( function($) {

    var storage = {
        activeMenuClass: "nav-all-open nav-contacts-open",
        swipeTime: 300,
        swipe_horizontal_percent: 35,
        getWrapper: function() {
            return $("body");
        },
        menu_is_active: function() {
            return this.getWrapper().hasClass( this.activeMenuClass );
        }
    };

    // Обработчики кликов
    var bindEvents = function() {
        // Открываем меню
        $(document).on( "click", ".mobile-nav-button.action", function() {
            showHiddenMenu(this);
            return false;
        });

        // Закрываем меню
        $(".mobile-nav-wrapper").on( "click", function() {
            hideHiddenMenu();
            return false;
        });

        // Блокируем всплытие кликов у меню-контейнера
        $(".mobile-nav-block-wrapper").on( "click", function(event) {
            event.stopPropagation();
        });

        // Клик по ссылке в меню
        $(".mobile-nav-block-wrapper").on( "click", "a", function() {
            onMenuClick( $(this) );
            return false;
        });

        var $body = document.body,
            $link = document.querySelectorAll(".mobile-nav-button.action");

        $body.addEventListener("touchend", onTouchEndController, false);
        $.each($link, function(){
            this.addEventListener("touchend", onMenuTouchEnd, false);
        });
    };

    var onTouchEndController = function(event) {
        var cancelTargetClass = [];

        var checkTargetClass = function($target, elementClass) {
            var result;

            if ( $target.hasClass(elementClass) ) {
                result = $target;

            } else if ( $target.closest("." + elementClass).length ) {
                result = $target.closest("." + elementClass);

            } else {
                result = false;
            }

            return result;
        };

        var is_passed = true;
        for (var i in cancelTargetClass ) {
            if (cancelTargetClass.hasOwnProperty(i)) {
                if ( checkTargetClass( $(event.target), cancelTargetClass[i]) ) {
                    is_passed = false;
                }
            }
        }

        if (is_passed) {
            onTouchEnd();
        }
    };

    // Клик по ссылке в меню
    var onMenuClick = function(selector) {
        var link_href = selector.attr("href"),
            menu_animate_time,
            animation_time;

        // Вычисляем время
        menu_animate_time = parseFloat( $(".mobile-nav-wrapper").css("transition-duration") ) * 1000;
        animation_time = menu_animate_time || 300;

        // Выполняем редирект после закрытия меню
        if (link_href) {

            // Скрываем меню
            hideHiddenMenu();

            // Если URL отличается от текущего, то редирект
            if ( location.pathname !== link_href ) {
                // Выполняем редирект после закрытия меню
                setTimeout( function() {
                    location.href = link_href;
                }, animation_time);
            }
        }
    };

    var onTouchEnd = function() {
        var menu_is_active = storage.menu_is_active(),
            orientation_x = (UserTouch.orientation.x),
            is_swipe = ( storage.swipeTime >= UserTouch.touchTime ),
            is_horizontal_swipe = false;

        if (is_swipe) {
            is_horizontal_swipe = ( Math.abs( parseInt( ( UserTouch.offsetDelta.y / UserTouch.offsetDelta.x ) * 100 ) ) <= storage.swipe_horizontal_percent );
            if (is_horizontal_swipe) {
                if (orientation_x === "left" && menu_is_active) {
                    hideHiddenMenu();
                }
            }
        }
    };

    var onMenuTouchEnd = function() {
        var menu_is_active = storage.menu_is_active(),
            orientation_x = (UserTouch.orientation.x),
            is_swipe = ( storage.swipeTime >= UserTouch.touchTime ),
            is_horizontal_swipe = false;

        if (is_swipe) {
            is_horizontal_swipe = ( Math.abs( parseInt( ( UserTouch.offsetDelta.y / UserTouch.offsetDelta.x ) * 100 ) ) <= storage.swipe_horizontal_percent );
            if (is_horizontal_swipe) {
                if (orientation_x === "right" && !menu_is_active) {
                    showHiddenMenu(this);
                }
            }

        }
    };

    // Показать скрытое меню
    var showHiddenMenu = function(el) {
        var nav = $(el).data('nav');
        $("body").addClass('nav-' + nav + '-open');
    };

    // Скрыть скрытое меню
    var hideHiddenMenu = function() {
        $("body").removeClass(storage.activeMenuClass);
    };

    // Вызов
    $(document).ready( function() {
        bindEvents();
    });

})(jQuery);

var MatchMedia = function( media_query ) {
    var matchMedia = window.matchMedia,
        is_supported = (typeof matchMedia === "function");
    if (is_supported && media_query) {
        return matchMedia(media_query).matches
    } else {
        return false;
    }
};

var scrollbarWidth = function() {
    var block = $('<div>').css({'height':'50px','width':'50px'}),
        indicator = $('<div>').css({'height':'200px'});

    $('body').append(block.append(indicator));
    var w1 = $('div', block).innerWidth();    
    block.css('overflow-y', 'scroll');
    var w2 = $('div', block).innerWidth();
    $(block).remove();
    return (w1 - w2);
}

// VIEW MORE ITEM MENU
;(function($, window, document, undefined) {
    
    function rCat (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, rCat.defaults, options);
        
        this.initialize();
        this.setup();
        
        $(window).on('resize', $.proxy(function(){
            window.clearTimeout(this.resizeTimer);
            this.resizeTimer = window.setTimeout($.proxy(function(e) { this.onResize(e); }, this), this.options.responsive_refresh_rate);
        }, this));
    };
    
    rCat.defaults = {
        wordwrap: false,
        after_item: null,
        append_more: true,
        after_item_lbl: 'More',
        responsive_refresh_rate: 200
    };
    
    rCat.prototype.initialize = function() {
        this.$after_item = $('<li class="parent"><a href="#" onClick="return false;">' + this.options.after_item_lbl + '</a><ul></ul></li>');
        if (this.options.after_item) {
            this.$after_item = $(this.options.after_item);
        }
        this.$element.append(this.$after_item);
        this.$items = this.$element.children('li');
    };
    
    rCat.prototype.setup = function() {
        this.box_width = this.$element.parent().width();
        
        if (this.options.append_more) {
            var _items_width = this.$after_item.outerWidth();
        } else {
            var _items_width = 0;
        }
        
        if (this.options.wordwrap) {
            this.$items.not(this.$after_item).each(function(index, item){
                var a = $(item).children('a');
                a.html('<span>' + a.html().replace(' ', '<br />') + '</span>');
            });
        }
        this.$items.hide();
        
        var $html = $('<div />');
        this.$items.not(this.$after_item).each($.proxy(function(index, item){
            
            _items_width += $(item).outerWidth();
            
            if (this.box_width < _items_width) {
                if (this.options.append_more) {
                    $html.append($(item).clone().removeAttr('style'));
                }
                return;
            }
            
            //$(item).show();
            $(item).css('display', 'block');
            
        }, this));
        
        if (this.options.append_more && $html.children().length) {
            this.$after_item.children('ul').html($html.html());
            this.$after_item.show();
        }
        
        this.$element.removeClass('r-cat');
        //this.$element.css({ overflow: 'visible' });
    };
    
    rCat.prototype.onResize = function() {
        if ( MatchMedia("only screen and (max-width: 992px)") ) {
            //this.$items.show();
            this.$items.css('display', 'block');
            this.$after_item.hide();
            return false;
        }
        /*
        if (this.box_width == this.$element.parent().width()) {
            return false;
        }
        */
        this.$element.addClass('r-cat');
        this.setup();
    };
    
    $.fn.rCat = function(options) {
    	return this.each(function() {
    		if (!$(this).data('rCat')) {
    			$(this).data('rCat', new rCat(this, options));
    		}
    	});
    };
    $.fn.rCat.Constructor = rCat;
    
})(window.jQuery, window, document);

//SHOW MORE TAGS .etc
;(function($, window, document, undefined) {

    function showMore(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, showMore.Defaults, options);
        
        this.setup();
        $(window).on('resize', $.proxy(function(){
            window.clearTimeout(this.resizeTimer);
    		this.resizeTimer = window.setTimeout($.proxy(function(e) { this.onResize(e); }, this), this.options.responsive_refresh_rate);
        }, this));
    };
    
    showMore.Defaults = {
        show_per_click: 5,
        show_all: false,
        btn_lbl: 'More',
        responsive_refresh_rate: 200
    };
    
    showMore.prototype.setup = function() {
        this.$element.addClass('show-more-box').children().hide().addClass('show-more-item');
    	this.button = $('<a href="#" class="show-more-button button">' + this.options.btn_lbl + '</a>');
    	this.button.click($.proxy(function() {
    	    this.filter = (!!this.filter && this.options.show_all) ? '' : ':lt(' + this.options.show_per_click + ')';
    	    var group = this.$element.children(':hidden' + this.filter);
    	    group.each(function(i, e){
                var $e = $(e);
                //$e.show();
                setTimeout(function(){
                    $e.show().addClass('ready');
                }, i * 80);
            });
            setTimeout($.proxy(function(){
                if (!this.$element.children(':hidden').length) {
                    this.button.hide();
                }
            }, this), group.length * 80);
            return false;
    	}, this));
    	this.$element.after(this.button);
    	this.button.click();
    };
    
    showMore.prototype.destroy = function() {
        this.$element
            .removeClass('show-more-box')
            .children().removeClass('show-more-item ready')
                       .attr('style', '');
            this.button.remove();
            this.filter = null;
    };
    
    showMore.prototype.onResize = function() {
        if ( MatchMedia("only screen and (min-width: 993px)") ) {
            if( !this.$element.hasClass('show-more-box') ) {
                this.setup();
            }
        } else {
            this.destroy();
        }
    };
    
    $.fn.showMore = function(options) {
    	return this.each(function() {
    		if (!$(this).data('showMore')) {
    			$(this).data('showMore', new showMore(this, options));
    		}
    	});
    };
    $.fn.showMore.Constructor = showMore;

})(window.jQuery, window, document);

// CUT DESCRIPTION
;(function($, window, document, undefined) {
    
    function collapsibleDescription(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, collapsibleDescription.defaults, options);
        
        this.setup();
    };
    
    collapsibleDescription.defaults = {
        expand_lbl: 'Expand description',
        collapse_lbl: 'Collapse description',
        collapse_height: 100
    };
    
    collapsibleDescription.prototype.setup = function() {
        this.button = $('<a href="#" class="collapsible-description-button collapse">' + this.options.collapse_lbl + '</a>')
        
        //this._height = this.$element.innerHeight();
        this.$element.children().wrapAll('<div class="collapsible-description-wrapper"></div>');
        this.$wrapper = this.$element.children();
        
        if (this.options.collapse_height > this.$wrapper.height()) {
            //console.log('collapsibleDescription: height <');
            return false;
        }
        this.button.click($.proxy(function(){
            if (this.button.hasClass('collapse')) {
                this.$element.animate({ height: this.options.collapse_height }, 'slow');
                this.button.html(this.options.expand_lbl);
            } else {
                this.$element.animate({ height: this.$wrapper.height() }, 'slow');
                this.button.html(this.options.collapse_lbl);
            }
            this.button.toggleClass('collapse expand');
            this.$element.toggleClass('collapse expand');
            return false;
        }, this));
        this.$element.addClass('collapsible-description expand').append(this.button);
        this.button.click();
    };
    
    $.fn.collapsibleDesc = function(options) {
    	return this.each(function() {
    		if (!$(this).data('collapsibleDesc')) {
    			$(this).data('collapsibleDesc', new collapsibleDescription(this, options));
    		}
    	});
    };
    $.fn.collapsibleDesc.Constructor = collapsibleDescription;
    
})(window.jQuery, window, document);

$(document).ready(function() {
    $('<style type="text/css">.dialog-margin { overflow: hidden; margin-right: ' + scrollbarWidth() + 'px; }</style>').appendTo('head');
    
    $('.base-menu .parent > a').append('<button class="toggle-menu-child"><i class="mdi-expand_more mdi-2x"></i></button>');
    $(document).on('click', '.toggle-menu-child', function(){
        var ul = $(this).closest('li.parent').find('ul:first');
        if (ul.is(':hidden')) {
            ul.slideDown();
            $(this).find('i').removeClass('mdi-expand_more').addClass('mdi-expand_less');
        } else {
            ul.slideUp();
            $(this).find('i').removeClass('mdi-expand_less').addClass('mdi-expand_more');
        }
        
        return false;
    });
    
    if (window.profitbuy.submenu_count) {
        $('.base-menu.type2 li.parent > a').each(function(){
            if ($(this).next().children('li').length > window.profitbuy.submenu_count) {
                var url = $(this).attr('href');
                $(this).next().append('<li class="submenu-show-all"><a href="' + url + '">' + window.profitbuy.translate('Show more') + '</a></li>');
            }
        });
    }
    
    $('.base-menu.type3 .selected').parents('ul').each(function(){
        $(this).show().prev().find('i').removeClass('mdi-expand_more').addClass('mdi-expand_less');
    });
    $('.base-menu.type3 .selected').children('ul').show().prev().find('i').removeClass('mdi-expand_more').addClass('mdi-expand_less');
    
    if ( MatchMedia("only screen and (min-width: 993px)") ) {
        $('.sidebar .brands').showMore({ show_all: true, btn_lbl: window.profitbuy.translate('More') });
        $('.sidebar .tags').showMore({ show_per_click: 20, btn_lbl: window.profitbuy.translate('More') });
    };

    $(document).on('click.toggle_menu', '.toggle-menu', function(){
        $(this).parent().parent().find('.sidebar-box').slideToggle();
        return false;
    });
    
    $(window).resize(function(){
        if ( !(MatchMedia("only screen and (max-width: 992px)")) ) {
            $('.sidebar-box').attr('style', '');
            $('.base-menu ul').attr('style', '');
            $('.base-menu .mdi-expand_less').removeClass('mdi-expand_less').addClass('mdi-expand_more');
        }
    });
    
    //DIALOGS
    $(document).on('click.close_dialog', '.dialog', function(e){
        
        if ($(e.target).hasClass('dialog-window')) {
            $(this).closest('.dialog').hide().find('.cart').empty();
            $('body, #footer-pane').removeClass('dialog-margin');
        }
        
        //return false;
    });
    $('.dialog').on('click.close_dialog', 'a.dialog-close', function () {
    
        $(this).closest('.dialog').hide().find('.cart').empty();
        $('body, #footer-pane').removeClass('dialog-margin');
        
        return false;
        
    });
    $(document).on('keyup.close_dialog', function(e) {
    
        if (e.keyCode == 27) {
            $(".dialog:visible").hide().find('.cart').empty();
            $('body, #footer-pane').removeClass('dialog-margin');
        }
        
    });
    
    //AUTH
    var auth = function(url, data, type, submit){
        if (data == 'undefined') {
            data = {};
        }
        if (submit == 'undefined') {
            sumbit = false;
        }
        if (type == 'undefined') {
            type = 'GET';
        }
        var d = $('#dialog');
        var c = d.find('.cart');
        c.append('<i class="icon32 loading"></i>');
        d.show();
        
        $('body, #footer-pane').addClass('dialog-margin');
        
        $.ajax({
            url: url,
            type: type,
            data: data,
            success: function(response){
                var _tmp = $(response);
                c.html(_tmp.find('#page').html());
                c.prepend('<a href="#" class="dialog-close"><i class="mdi-close mdi-2x"></i></a>');
                
                if(submit && !c.find('.wa-error').length){
                    
                    $(document).off('keyup.close_dialog');
                    $(document).off('click.close_dialog');
                    $('.dialog').off('click.close_dialog').on('click.close_dialog', 'a.dialog-close', function(){
                        $(this).closest('.dialog').hide().find('.cart').empty();
                        $(this).attr('href', location.href);
                    });
                    
                    var text =  '<p>' +
                                    '<a href="' + window.profitbuy.home_url + '">' + window.profitbuy.translate('Back to home page') + '</a> ' + 
                                    window.profitbuy.translate('or') +
                                    ' <a href="' + location.href + '">' + window.profitbuy.translate('back to current page') + '</a>' +
                                '</p>';
                    
                    if (!_tmp.find('#page').length) {
                        var text =  '<h1>' + window.profitbuy.translate('Congratulations!') + '</h1>' +
                                    '<p>' + window.profitbuy.translate('Authorization was successful!') + '</p>' + text;
                    }
                    
                    c.append(text);
                }
                
                c.find('form').attr('action', url).submit(function(){
                    var fields = $(this).serializeArray();
                	var params = {};
                	for (var i = 0; i < fields.length; i++) {
                		if (fields[i].value !== '') {
                		    params[fields[i].name] = ''+fields[i].value;
                		}
                	}
                	c.empty();
                	auth(url, params, 'POST', true);
                    
                    return false;
                });
                
                c.find('.wa-submit a, a.auth-action-link').click(function(){
                    c.empty();
                    auth($(this).attr('href'));
                    return false;
                });
            }
        });
    };
    if ( MatchMedia("only screen and (min-width: 993px)") ) {
        $('.authpopup').click(function(){
            auth($(this).attr('href'));
            
            return false;
        });
    };

    //BACK TO TOP
    $(window).scroll(function () {
	    if ( MatchMedia("only screen and (min-width: 993px)") ) {
    	    var wrapper = $("#back-top-wrapper");
    		if ($(this).scrollTop() > 100) {
    		    wrapper.fadeIn();
    		    //wrapper.addClass('active');
    		} else {
    		    wrapper.fadeOut();
    		    //wrapper.removeClass('active');
    		}
		}
	});
	$('#back-top').click(function () {
		$('body,html').animate({ scrollTop: 0 }, 800);
		return false;
	});
	
    // MAILER app email subscribe form
    $('#mailer-subscribe-form input.charset').val(document.charset || document.characterSet);
    $('#mailer-subscribe-form').submit(function() {
        var form = $(this);

        var email_input = form.find('input[name="email"]');
        var email_submit = form.find('input[type="submit"]');
        if (!email_input.val()) {
            email_input.addClass('error');
            return false;
        } else {
            email_input.removeClass('error');
        }
        
        email_submit.hide();
        email_input.after('<i class="icon16 loading"></i>');

        $('#mailer-subscribe-iframe').load(function() {
            $('#mailer-subscribe-form').hide();
            $('#mailer-subscribe-iframe').hide();
            $('#mailer-subscribe-thankyou').show();
        });
    });
    
    // FLYING CART
    if(window.profitbuy.flying_cart_item){
	    
        $("#flying-cart").off('click.flying-cart-del').on('click.flying-cart-del', '.flying-cart-del', function(){
            var li = $(this).closest('li');
            
            window.profitbuy.loading.overlayAdd($('#flying-cart'));
            $.post(window.profitbuy.shop_url + 'cart/delete/', {html: 1, id: li.data('id')}, function (response) {
                li.animate({opacity: 0}, 'slow', function(){
                    
                    if (response.data.count == 0) {
                        //response.data.total = window.profitbuy.translate('Empty');
                        $('#cart').addClass('empty');
                    }
                    $(".cart-total").html(response.data.total);
                    $(".cart-count").attr('data-count', response.data.count);
                    
                    li.remove();
                    window.profitbuy.setFlyingHeight();
                });
                window.profitbuy.loading.overlayRemove($('#flying-cart'));
            }, "json");
            return false;
        });
        
        $("#flying-cart").off('change.flying-cart-qty').on('change.flying-cart-qty', '.flying-cart-qty', function(){
            var self = $(this), li = self.closest('li');
            self.val(self.val() > 0 ? self.val() : 1);
            
            window.profitbuy.loading.overlayAdd($('#flying-cart'));
            $.post(window.profitbuy.shop_url + 'cart/save/', {html: 1, id: li.data('id'), quantity: self.val()}, function (response) {
                li.find('.price').html(response.data.item_total);
                if (response.data.q) {
                    self.val(response.data.q);
                }
                if (response.data.error) {
                    alert(response.data.error);
                } else {
                    self.removeClass('error');
                }
                
                $(".cart-total").html(response.data.total);
                $(".cart-count").attr('data-count', response.data.count);
                window.profitbuy.loading.overlayRemove($('#flying-cart'));
            }, "json");
        });
        if ($('#flying-cart').length) {
            window.profitbuy.setFlyingHeight();
        }
        
    };
    
});

$(window).load(function(){

    if ( MatchMedia("only screen and (min-width: 993px)") ) {

    $('ul.base-menu.pages-top').rCat({ after_item_lbl: window.profitbuy.translate('More') });
    $('ul.base-menu.tree').rCat({ after_item: '<li class="parent"><a href="#" onClick="return false;"><i class="mdi-menu mdi-lg pull-left"></i>' + window.profitbuy.translate('More') + '</a><ul></ul></li>' });
    
    }
    
});