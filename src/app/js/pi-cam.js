$(function() {
  var itemIndex = 0;

      var addItemsToContainer = function(data) {

        var e = $('#item-container');

        $.each([].concat(data.images || data || []), function(index, image) {

          var n = $(e).prepend('<div id="pi_cam_item_' + itemIndex + '" class="pull-left"><a href="' + image.image + '" data-lightbox="pi-cam-image"><img src="' + image.thumbnail + '" class="thumbnail" /></a></div>');

          $('#pi_cam_item_' + itemIndex).hide().fadeIn(500);

          itemIndex++;

        });

      };

      $(function() {

        // get all the existing items
        $.ajax('get.items', {
          dataType: 'json'
        }).done(addItemsToContainer);

        $('#take-picture').on('click', function() {

          $.ajax('take.picture', {
            dataType: 'json'
          }).done(addItemsToContainer);

        });

        $('#take-video').on('click', function() {

          $('i', this).addClass('fa-blink');

        });

      });
});