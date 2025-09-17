(function ($) {
  "use strict";

  function initSidebarMenu(menuSelector) {
    const animationSpeed = 300;
    const $menu = $(menuSelector);

    $menu.on("click", "li > a", function (e) {
      const $this = $(this);
      const $submenu = $this.next();

      if ($submenu.is(".treeview-menu")) {
        e.preventDefault();

        if ($submenu.is(":visible")) {
          // Collapse
          $submenu.slideUp(animationSpeed).removeClass("menu-open");
          $submenu.parent("li").removeClass("active");
        } else {
          // Expand
          const $parent = $this.closest("ul");
          $parent.find("ul:visible").slideUp(animationSpeed).removeClass("menu-open");
          $parent.find("li.active").removeClass("active");

          $submenu.slideDown(animationSpeed).addClass("menu-open");
          $this.parent("li").addClass("active");
        }
      }
    });
  }

  function initSidebarControls() {
    // Toggle sidebar
    $(".toggle-sidebar").on("click", () => $(".page-wrapper").toggleClass("toggled"));

    // Pin sidebar
    $(".pin-sidebar").on("click", function () {
      const $wrapper = $(".page-wrapper");
      const $sidebar = $("#sidebar");

      if ($wrapper.hasClass("pinned")) {
        $wrapper.removeClass("pinned");
        $sidebar.off("mouseenter mouseleave");
      } else {
        $wrapper.addClass("pinned");
        $sidebar
          .on("mouseenter", () => $wrapper.addClass("sidebar-hovered"))
          .on("mouseleave", () => $wrapper.removeClass("sidebar-hovered"));
      }
    });

    // Overlay click
    $("#overlay").on("click", () => $(".page-wrapper").toggleClass("toggled"));

    // Responsive behavior
    $(window).on("resize", function () {
      const $wrapper = $(".page-wrapper");
      if ($(this).width() <= 768) $wrapper.removeClass("pinned");
      if ($(this).width() >= 768) $wrapper.removeClass("toggled");
    });
  }

  function initUIHelpers() {
    // Date picker loading simulation
    setTimeout(() => {
      $("#datepicker-loader").addClass("d-none");
      $("#datepicker").removeClass("d-none");
    }, 2000);

    // Loading screen
    $("#loading-wrapper").fadeOut(3000);

    // Day sorting buttons
    $(".day-sorting .btn").on("click", function () {
      $(".day-sorting .btn").removeClass("btn-primary");
      $(this).addClass("btn-primary");
    });

    // Month display
    const monthNames = [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December"
    ];
    $(".monthDisplay").text(`In ${monthNames[new Date().getMonth()]}`);

    // Weekdays buttons
    $(".week-days").on("click", "a", function () {
      $(".week-days a")
        .removeClass("bg-primary text-white")
        .addClass("bg-secondary-subtle");
      $(this)
        .addClass("bg-primary text-white")
        .removeClass("bg-secondary-subtle");
    });

    // Weekdays button group
    $(".week-days-btn-group").on("click", ".btn", function () {
      $(".week-days-btn-group .btn")
        .removeClass("btn-primary")
        .addClass("btn-light");
      $(this)
        .addClass("btn-primary")
        .removeClass("btn-light");
    });

    // Current day display
    const today = new Date();
    $(".day").text(today.toLocaleString("default", { weekday: "long" }));
    $(".today-date").text(today.getDate());
  }

  function initBootstrapComponents() {
    // Tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new bootstrap.Tooltip(el);
    });

    // Popovers
    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
      new bootstrap.Popover(el);
    });
  }

  // Initialize all on DOM ready
  $(function () {
    initSidebarMenu(".sidebar-menu");
    initSidebarControls();
    initUIHelpers();
    initBootstrapComponents();
  });

  // Expose a reinit function for React remounts
  window.reinitSidebar = function () {
    initSidebarMenu(".sidebar-menu");
    initSidebarControls();
  };

})(jQuery);
