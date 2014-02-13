(function($) {
	var loadTemplates = function(path){
		Stevenson.ui.Loader.display('Loading templates...', 100);
		Stevenson.repo.getFiles({
			path: '_layouts',
			success: function(files){
				$('#templates').html('');
				$.each(files, function(index, file){
					if(file.path.indexOf('_layouts') != -1 && file.path != '_layouts'){
						Stevenson.log.info('Adding layout: '+file.path);
						var id = file.path.replace('.html','').replace('_layouts/','');
						file.id = id;
						$('#templates').mustache('template', file);
					}
				});
				Stevenson.ui.Loader.hide();
			},
			error: function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Unable to load templates: ' + message);
			}
		});
	};
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Initializing files');
		$('.breadcrumb .repo').html(Stevenson.Account.repo);
		loadTemplates();
	});
})(jQuery);
