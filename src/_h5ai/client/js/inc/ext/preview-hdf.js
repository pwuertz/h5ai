
modulejs.define('ext/preview-hdf', ['_', '$', 'core/settings', 'core/event', 'core/resource'], function (_, $, allsettings, event, resource) {

	var settings = _.extend({
			enabled: false,
			base_url: "",
			webhdf_url: "",
		}, allsettings['preview-hdf']),

		template = '<div id="pv-hdf-overlay" class="noSelection">' +
						'<div id="pv-hdf-close"/>' +
						'<div id="pv-hdf-content">' +
							'<iframe id="pv-hdf-iframe" style="height: 100%; width: 100%; margin: 0px; padding: 0px; border-width: 0"></iframe>' +
						'</div>' +
						'<div id="pv-hdf-bottombar" class="clearfix">' +
							'<ul id="pv-hdf-buttons">' +
								'<li id="pv-hdf-bar-size" class="bar-left bar-label"/>' +
								'<li id="pv-hdf-bar-label" class="bar-left bar-label"/>' +
								'<li id="pv-hdf-bar-close" class="bar-right bar-button"><img src="' + resource.image('preview/close') + '"/></li>' +
							'</ul>' +
						'</div>' +
					'</div>',

		adjustSize = function () {
			var $window = $(window),
				$container = $('#pv-hdf-content'),
				margin = 20,
				barheight = 31;

			$container.css({
				height: $window.height() - 2 * margin - barheight - 32,
				top: margin
			});
		},
		
		onKeydown = function (event) {
			var key = event.which;

			if (key === 27) { // esc
				onExit();
			}

			event.preventDefault();
			event.stopImmediatePropagation();
		},

		onEnter = function (item) {
			$(window).on('keydown', onKeydown);
			$('#pv-hdf-overlay').stop(true, true).fadeIn(200);
			$('#pv-txt-bar-label').text(item.label);
			$('#pv-txt-bar-size').text('' + item.size + ' bytes');
			
			var iframe = $("#pv-hdf-iframe")[0];
			var path = item.absHref.substring(settings.base_url.length);
			iframe.src = "/py/webhdf/webhdf.wsgi?path="+encodeURIComponent(path);
		},

		onExit = function () {
			$(window).off('keydown', onKeydown);
			$('#pv-hdf-overlay').stop(true, true).fadeOut(200);
		},

		initItem = function (item) {
			if (item.$view && item.type == "hdf" && (item.absHref.lastIndexOf(settings.base_url, 0) === 0)) {
				item.$view.find('a').on('click', function (event) {
					event.preventDefault();
					onEnter(item);
				});
			}
		},

		onLocationChanged = function (item) {
			_.each(item.content, initItem);
		},

		onLocationRefreshed = function (item, added, removed) {
			_.each(added, initItem);
		},

		init = function () {
			console.log("hdf-preview: " + settings.enabled);
			if (!settings.enabled) {
				return;
			}

			$(template).appendTo('body');
			$('#pv-hdf-bar-close, #pv-hdf-close').on('click', onExit);

			$('#pv-hdf-close')
				.on('mouseenter', function () {
					$('#pv-hdf-bar-close').addClass('hover');
				})
				.on('mouseleave', function () {
					$('#pv-hdf-bar-close').removeClass('hover');
				});


			$('#pv-hdf-overlay')
				.on('click mousedown mousemove keydown keypress', function (event) {
					event.stopImmediatePropagation();
				});

			event.sub('location.changed', onLocationChanged);
			event.sub('location.refreshed', onLocationRefreshed);

			$(window).on('resize load', adjustSize);
		};

	init();
});
