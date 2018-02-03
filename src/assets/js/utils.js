// Switch Header styling when scrolled to anchor
function scroll_style() {
    var window_top = $(window).scrollTop();
    var div_top = $('#pgTitle');

    if (div_top.length) {
        var anchorPoint = div_top.offset().top;

        if (window_top > anchorPoint - 100) {
            $("#header").addClass("dark");
        } else {
            $("#header").removeClass("dark");
        }
    }

    if (window_top > 100) {
        $(".scroll-top-btn").addClass("visible");
    } else {
        $(".scroll-top-btn").removeClass("visible");
    }
}

$(function () {
    $(window).scroll(scroll_style);
    scroll_style();
});

// Collapse Menu when navigating to route
$(document).on('click', '.navbar-collapse.show', function (e) {
    $(this).collapse('hide');
});

// Collapse main navigation drop menus on click
$(function () {
    $('.dropdown-item').click(function () {
        $('#mainNav').collapse('hide');
    });
});