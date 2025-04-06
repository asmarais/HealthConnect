/**
 * @package Helix Ultimate Framework
 * @author JoomShaper https://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2018 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or Later
*/

jQuery(function ($) {

    // Stikcy Header
    if ($('body').hasClass('sticky-header')) {
        var header = $('#sp-header');

        if($('#sp-header').length) {
            var headerHeight = header.outerHeight();
            var stickyHeaderTop = header.offset().top;
            var stickyHeader = function () {
                var scrollTop = $(window).scrollTop();
                if (scrollTop > stickyHeaderTop) {
                    header.addClass('header-sticky');
                } else {
                    if (header.hasClass('header-sticky')) {
                        header.removeClass('header-sticky');
                    }
                }
            };
            stickyHeader();
            $(window).scroll(function () {
                stickyHeader();
            });
        }

        if ($('body').hasClass('layout-boxed')) {
            var windowWidth = header.parent().outerWidth();
            header.css({"max-width": windowWidth, "left": "auto"});
        }
    }

    // go to top
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.sp-scroll-up').fadeIn();
        } else {
            $('.sp-scroll-up').fadeOut(400);
        }
    });

    $('.sp-scroll-up').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });

    // Preloader
    $(window).on('load', function () {
        $('.sp-preloader').fadeOut(500, function() {
            $(this).remove();
        });
    });

    //mega menu
    $('.sp-megamenu-wrapper').parent().parent().css('position', 'static').parent().css('position', 'relative');
    $('.sp-menu-full').each(function () {
        $(this).parent().addClass('menu-justify');
    });

    // Offcanvs
    $('#offcanvas-toggler').on('click', function (event) {
        event.preventDefault();
        $('.offcanvas-init').addClass('offcanvas-active');
    });

    $('.close-offcanvas, .offcanvas-overlay').on('click', function (event) {
        event.preventDefault();
        $('.offcanvas-init').removeClass('offcanvas-active');
    });
    
    $(document).on('click', '.offcanvas-inner .menu-toggler', function(event){
        event.preventDefault();
        $(this).closest('.menu-parent').toggleClass('menu-parent-open').find('>.menu-child').slideToggle(400);
    });

    //Tooltip
    $('[data-toggle="tooltip"]').tooltip();

    // Article Ajax voting
    $('.article-ratings .rating-star').on('click', function (event) {
        event.preventDefault();
        var $parent = $(this).closest('.article-ratings');

        var request = {
            'option': 'com_ajax',
            'template': template,
            'action': 'rating',
            'rating': $(this).data('number'),
            'article_id': $parent.data('id'),
            'format': 'json'
        };

        $.ajax({
            type: 'POST',
            data: request,
            beforeSend: function () {
                $parent.find('.fa-spinner').show();
            },
            success: function (response) {
                var data = $.parseJSON(response);
                $parent.find('.ratings-count').text(data.message);
                $parent.find('.fa-spinner').hide();

                if(data.status)
                {
                    $parent.find('.rating-symbol').html(data.ratings)
                }

                setTimeout(function(){
                    $parent.find('.ratings-count').text('(' + data.rating_count + ')')
                }, 3000);
            }
        });
    });


    // ************    Start Medico Script    ************* //
    // **************************************************** //
    // For top bar
    $('#sp-top-bar, #sp-header').wrapAll("<div class='header-wrapper'></div>")

    //Contact page
    $('.contact-section>div>div.sppb-row').wrap('<div class="container-inner"></div>')

    //For custom feature box
    $('.sppb-addon-feature.style-one, .sppb-addon-feature.style-two').on('hover', function(e){
        $(this).find('.sppb-addon-text').slideToggle(300);
    })
    
    //Testimonial Pro
    // $('.sppb-testimonial-pro').mousemove(function (e) {
    //     console.log(e.pageX, e.pageY);
    //     $('.sppb-testimonial-pro').find('.sppb-testimonial-pro:before').css('background', 'red')
    // })

    // Top Search
    $(".search-open-icon").on('click', function () {
        $(".top-search-input-wrap, .top-search-overlay").fadeIn(200);
        $(this).hide();
        $('.search-close-icon').show().css('display', 'inline-block');
        $('body.off-canvas-menu-init').css({
            'overflow-y': 'hidden'
        });
        $('#sp-header').css({
            'z-index': '999'
        });
        $('.top-search-input-wrap').css('height', '100vh');
    });

    $(".search-close-icon, .top-search-overlay").on('click', function () {
        $(".top-search-input-wrap, .top-search-overlay").fadeOut(200);
        $('.search-close-icon').hide();
        $('.search-open-icon').show();
        $('body.off-canvas-menu-init').css({
            'overflow-y': 'initial'
        });
        $('#sp-header').css({
            'z-index': '99'
        });
        $('.top-search-input-wrap').css('height', '100%');
    });

    // press esc to hide search
    $(document).keyup(function (e) {
        if (e.keyCode == 27) { // esc keycode
            $(".top-search-input-wrap").fadeOut(200);
            $(".search-close-icon").fadeOut(200);
            $(".search-open-icon").delay(200).fadeIn(200);
            $('body.off-canvas-menu-init').css({
                'overflow-y': 'initial'
            });
        }
    });
    // End Top Search

    //For react template
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var newNodes = mutation.addedNodes;
            if (newNodes !== null) {
                var $nodes = $(newNodes);

                $nodes.each(function () {
                    var $node = $(this);
                    $node.find('.custom-feature-box').each(function () {
                        //For custom feature box
                        // $('.custom-feature-box').on('hover', function () {
                        //     $(this).find('.sppb-addon-text').slideToggle(300);
                        // })
                    });
                });

            }
        });
    });

    var config = {
        childList: true,
        subtree: true
    };
    // Pass in the target node, as well as the observer options
    observer.observe(document.body, config);

    // For component will move to component
    //Pagination
    $('.pagination .page-link.next').closest("li").addClass('next-wrapper');
    $('.pagination .page-link.previous').closest("li").addClass('previous-wrapper');
});
