jQuery(document).ready(function(){
    if (jQuery('input.search, input.tx-indexedsearch-searchbox-sword, input.indexed-search-atocomplete-sword, input.indexed-search-autocomplete-sword').length > 0) {
        initIndexSearchAutocomplete();
    }
});

function initIndexSearchAutocomplete() {
    var wait = 0;

    jQuery('input.search, input.tx-indexedsearch-searchbox-sword, input.indexed-search-atocomplete-sword, input.indexed-search-autocomplete-sword')
       .on('keypress keyup', jQuery.debounce( 250, autoComplete )).attr('autocomplete', 'off');

    $('*').click(function() {
       var elem = $(this);
       var targetClass = '.search-autocomplete-results';

       if ($('.search-autocomplete-results > *').length == 0) {
           return; // Result-Div is not shown
       }

       while(elem.prop("tagName") != 'HTML' && !elem.hasClass(targetClass)) {
           elem = elem.parent();
       }

       if (elem.prop("tagName") == 'HTML') {
           $(targetClass).html('').hide().removeClass('results').addClass('no-results');
       }

    });


    function autoComplete(e) {
        var $input = $(this);
        var $elem = $(this);
        var $results;
        while($elem.prop("tagName") !== 'HTML') {
            $results = $elem.find('.search-autocomplete-results');
            if ($results.length > 0) {
                break;
            }
            $elem = $elem.parent();
        }
        if ($elem.prop("tagName") === 'HTML') {
            console.log("we couldn't find a result div (.search-autocomplete-results)");
            return ;
        }

        var mode = typeof $results.data('mode') === 'undefined' ? 'word' : $results.data('mode');
        var soc = $results.data('searchonclick') == true;

        // navigate through the suggestion-results
        if (e.which === 38 || e.which === 40 || e.keyCode === 10 || e.keyCode === 13) { // up / down / enter

            if (e.which === 38 && e.type === 'keyup') { // up
                var $prev = $results.find('li.highlighted').prev();

                if ($results.find('li.highlighted').length === 0 || $prev.length === 0) {
                    $results.find('li.highlighted').removeClass('highlighted');
                    $results.find('li').last().addClass('highlighted');
                    return;
                }

                $results.find('li.highlighted').removeClass('highlighted');
                $prev.addClass('highlighted');
            }

            if (e.which === 40 && e.type === 'keyup') { // down
                var $next = $results.find('li.highlighted').next();
                if ($results.find('li.highlighted').length === 0 || $next.length === 0) {
                    $results.find('li.highlighted').removeClass('highlighted');
                    $results.find('li').first().addClass('highlighted');
                    return;
                }

                $results.find('li.highlighted').removeClass('highlighted');
                $next.addClass('highlighted');
            }

            if ((e.keyCode === 10 || e.keyCode === 13) && e.type === 'keypress') { // enter
                if ($results.is(':visible') && $results.find('li.highlighted').length > 0) {
                    if (mode === 'word') {
                        $results.find('li.highlighted').click();
                        if (soc) {
                            $input.closest('form').submit();
                        }
                    } else {
                        window.location = $results.find('li.highlighted a.navigate-on-enter').attr('href');
                    }
                    e.preventDefault();
                }
            }

            return;
        }

        if (e.type !== 'keyup') {
            return;
        }

        $results.html('').hide().removeClass('results').addClass('no-results');

        var val = $(this).val();
        var minlen = typeof $results.data('minlength') === 'undefined' ? 3 : $results.data('minlength');
        var maxResults = typeof $results.data('maxresults') === 'undefined' ? 10 : $results.data('maxresults');


        if (val.length < minlen) {
            return;
        }


        $results.addClass('autocomplete_searching');

        $.ajax({
            url: $results.data('searchurl'),
            cache: false,
            method: 'POST',
            data: {
                s: val,
                m: mode,
                mr: maxResults
            },
            success: function (data) {
                $li = $results
                    .show()
                    .html(data)
                    .removeClass('autocomplete_searching')
                    .find('li');
                $li.click(function() {
                    $input.val($(this).text().trim());
                    $results.html('').hide();
                });
                if ($li.length == 0) {
                    $results.html('').hide();
                    $results.removeClass('results').addClass('no-results');
                } else {
                    $results.removeClass('no-results').addClass('results');
                }
            }
        });
    }
}


/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(window,undefined){
    var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
        // Internal method reference.
        jq_throttle;
    $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
        // After wrapper has stopped being called, this timeout ensures that
        // `callback` is executed at the proper times in `throttle` and `end`
        // debounce modes.
        var timeout_id,

            // Keep track of the last time `callback` was executed.
            last_exec = 0;

        // `no_trailing` defaults to falsy.
        if ( typeof no_trailing !== 'boolean' ) {
            debounce_mode = callback;
            callback = no_trailing;
            no_trailing = undefined;
        }

        // The `wrapper` function encapsulates all of the throttling / debouncing
        // functionality and when executed will limit the rate at which `callback`
        // is executed.
        function wrapper() {
            var that = this,
                elapsed = +new Date() - last_exec,
                args = arguments;

            // Execute `callback` and update the `last_exec` timestamp.
            function exec() {
                last_exec = +new Date();
                callback.apply( that, args );
            };

            // If `debounce_mode` is true (at_begin) this is used to clear the flag
            // to allow future `callback` executions.
            function clear() {
                timeout_id = undefined;
            };

            if ( debounce_mode && !timeout_id ) {
                // Since `wrapper` is being called for the first time and
                // `debounce_mode` is true (at_begin), execute `callback`.
                exec();
            }

            // Clear any existing timeout.
            timeout_id && clearTimeout( timeout_id );

            if ( debounce_mode === undefined && elapsed > delay ) {
                // In throttle mode, if `delay` time has been exceeded, execute
                // `callback`.
                exec();

            } else if ( no_trailing !== true ) {
                // In trailing throttle mode, since `delay` time has not been
                // exceeded, schedule `callback` to execute `delay` ms after most
                // recent execution.
                //
                // If `debounce_mode` is true (at_begin), schedule `clear` to execute
                // after `delay` ms.
                //
                // If `debounce_mode` is false (at end), schedule `callback` to
                // execute after `delay` ms.
                timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
            }
        };

        // Set the guid of `wrapper` function to the same of original callback, so
        // it can be removed in jQuery 1.4+ .unbind or .die by using the original
        // callback as a reference.
        if ( $.guid ) {
            wrapper.guid = callback.guid = callback.guid || $.guid++;
        }

        // Return the wrapper function.
        return wrapper;
    };
    $.debounce = function( delay, at_begin, callback ) {
        return callback === undefined
               ? jq_throttle( delay, at_begin, false )
               : jq_throttle( delay, callback, at_begin !== false );
    };
})(this);
