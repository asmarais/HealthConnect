/**
 * @package     SP Medical Search
 * @subpackage  mod_spmedicalsearch
 *
 * @copyright   Copyright (C) 2010 - 2018 JoomShaper. All rights reserved.
 * @license     GNU General Public License version 2 or later.
 */

jQuery(function ($) {

  $('.mod-spmedical-search .spmedical-search').submit(function (e) {

    var that = $(this);

    var rooturl = that.find('#url').val();
    var menuid = that.find('#menuid').val();

    var departmentId = that.find('#spmedical-departments').val();
    var specialityName = that.find('#spmedical-specialities').val();
    var specialistId = that.find('#spmedical-specialists').val();

    var searchitem = '&searching=' + 1;

    var department = '';
    if (departmentId) {
      var department = '&departmentid=' + departmentId;
    }

    var specialist = '';
    if (specialistId) {
      specialist = '&specialistid=' + specialistId;
    }

    var speciality = '';
    if (specialityName) {
      var speciality = '&speciality=' + specialityName;
    }

    var search_queries = searchitem + department + specialist + speciality;
    window.location = rooturl + 'index.php?option=com_spmedical&view=specialists' + search_queries + menuid + '';
    return false;
  });

  // select suggest box
  if ($('.spmedical-combobox').length) {
    $(function () {
      $.widget("custom.combobox", {
        _create: function () {
          this.wrapper = $("<span>")
            .addClass("custom-combobox")
            .insertAfter(this.element);

          this.element.hide();
          this._createAutocomplete();
          this._createShowAllButton();
        },

        _createAutocomplete: function () {
          var selected = this.element.children(":selected"),
            value = selected.val() ? selected.text() : "";

          this.input = $("<input>")
            .appendTo(this.wrapper)
            .val(value)
            .attr("title", "")
            .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
            .autocomplete({
              delay: 0,
              minLength: 0,
              source: $.proxy(this, "_source")
            })
            .tooltip({
              classes: {
                "ui-tooltip": "ui-state-highlight"
              }
            });

          this._on(this.input, {
            autocompleteselect: function (event, ui) {
              ui.item.option.selected = true;
              this._trigger("select", event, {
                item: ui.item.option
              });
            },

            autocompletechange: "_removeIfInvalid"
          });
        },

        _createShowAllButton: function () {
          var input = this.input,
            wasOpen = false

          $("<a>")
            .attr("tabIndex", -1)
            .attr("title", "Show All Items")
            .attr("height", "")
            .tooltip()
            .appendTo(this.wrapper)
            .button({
              icons: {
                primary: "ui-icon-triangle-1-s"
              },
              text: "false"
            })
            .removeClass("ui-corner-all")
            .addClass("ui-button ui-widget custom-combobox-toggle ui-corner-right")
            .on("mousedown", function () {
              wasOpen = input.autocomplete("widget").is(":visible");
            })
            .on("click", function () {
              input.trigger("focus");

              // Close if already visible
              if (wasOpen) {
                return;
              }

              // Pass empty string as value to search for, displaying all results
              input.autocomplete("search", "");
            });
        },

        _source: function (request, response) {
          var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
          response(this.element.children("option").map(function () {
            var text = $(this).text();
            if (this.value && (!request.term || matcher.test(text)))
              return {
                label: text,
                value: text,
                option: this
              };
          }));
        },

        _removeIfInvalid: function (event, ui) {

          // Selected an item, nothing to do
          if (ui.item) {
            return;
          }

          // Search for a match (case-insensitive)
          var value = this.input.val(),
            valueLowerCase = value.toLowerCase(),
            valid = false;
          this.element.children("option").each(function () {
            if ($(this).text().toLowerCase() === valueLowerCase) {
              this.selected = valid = true;
              return false;
            }
          });

          // Found a match, nothing to do
          if (valid) {
            return;
          }

          // Remove invalid value
          this.input
            .val("")
            .attr("title", value + " didn't match any item")
            .tooltip("open");
          this.element.val("");
          this._delay(function () {
            this.input.tooltip("close").attr("title", "");
          }, 2500);
          this.input.autocomplete("instance").term = "";
        },

        _destroy: function () {
          this.wrapper.remove();
          this.element.show();
        }
      });

      $(".spmedical-combobox").combobox();
      $("#toggle").on("click", function () {
        $(".spmedical-combobox").toggle();
      });
      $('.custom-combobox-toggle').html('<i class="medico-dropdown"></i>');
      $('.custom-combobox-toggle').on('click', function () {
        $(this).toggleClass('active');
      });
      $('.custom-combobox').on('click', function (e) {
        e.stopPropagation();
      })
      $(document).on('click', function (e) {
        $('.custom-combobox-toggle').removeClass('active');
      })

      // Set placeholders into search fields
      let departmentsPlaceholder = $('#spmedical-departments').data('placeholder');
      let specialitiesPlaceholder = $('#spmedical-specialities').data('placeholder');
      let specialistsPlaceholder = $('#spmedical-specialists').data('placeholder');

      $("#spmedical-departments+.custom-combobox>.custom-combobox-input").attr("placeholder", departmentsPlaceholder) ;
      $("#spmedical-specialities+.custom-combobox>.custom-combobox-input").attr("placeholder", specialitiesPlaceholder) ;
      $("#spmedical-specialists+.custom-combobox>.custom-combobox-input").attr("placeholder", specialistsPlaceholder) ;
    });
  }

  // 
});
