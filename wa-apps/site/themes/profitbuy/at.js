( function ($) {
    
    $.getScript = function(u,s,c) {
        return $.ajax({
            url: u,
            dataType: "script",
            success: s || {},
            cache: c || false
        });
    };
    
    $.at = $.at || { };
    
    $.at.t = function ( m ) {
        var t = this;
        if (t.messages && t.messages[t.locale] && t.messages[t.locale][m]) {
            return t.messages[t.locale][m];
        } else if (t.messages && t.messages[m]) {
            return t.messages[m];
        }
        return m;
    };
    
    $.at.o = {
        a: function ( c, s ) {
            s = s || 16;
            if ( c.css('position') == 'static' ) {
                c.css('position', 'relative');
            }
            c.addClass('at-loading-overlay-active')
             .append('<div class="at-loading-overlay"><i class="icon' + s + ' loading" style="margin-top: -' + (s/2) + 'px; margin-left: -' + (s/2) + 'px;"></i></div>');
        },
        r: function ( c ) {
            c.removeClass('at-loading-overlay-active').find('.at-loading-overlay').remove();
        }
    };
    
    $.at.pL = function (o) {
        var t = this,
            f = false,
            su = o.success || f,
            ca = o.cache || f,
            l = o.label || f,
            h = o.href || f,
            s = o.src || f,
            d = f;
        
        if ( l && t.plugins[l] ) {
            h = h || t.plugins[l].href || f;
            s = s || t.plugins[l].src || f;
            d = t.plugins[l].is_done();
        }
        
        if ( !s ) {
            console.log('Plugin load error: Not found');
            return f;
        }
        
        var c = function () {
            if ( su && typeof(su) === "function" ) {
                su();
            }
        };
        
        if ( h && l && !$('#' + l.replace('.','-') + '-css').length ) {
            $('head').append('<link href="' + h + '" rel="stylesheet" type="text/css" id="' + l.replace('.','-') + '-css" />');
        } else if ( h && !$('link[href="' + h + '"]').length ) {
            $('head').append('<link href="' + h + '" rel="stylesheet" type="text/css" />');
        }
        
        if ( d ) {
            c();
        } else {
            if ( l ) {
                t.xhr = t.xhr || {};
                if ( !t.xhr[l] ) {
                    t.xhr[l] = $.getScript(s,c,true).fail( function (j,s,e) {
                        console.log('Plugin load error: ' + e);
                    }).done(function(){
                        delete t.xhr[l];
                    });
                } else {
                    t.xhr[l].done(c);
                }
            } else {
                $.getScript(s,c,true).fail( function (j,s,e) {
                    console.log('Plugin load error: ' + e);
                });
            }
        }
        
    };
    
})(jQuery);