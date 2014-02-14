(function($) {
	var editorConfig = null;
	var currentPage = null;
	var loadEditor = function(layout, properties){
		Stevenson.repo.getEditorConfig({
			layout: layout,
			success: function(config){
				editorConfig = config;
				Stevenson.ui.Editor.load(editorConfig, properties);
				Stevenson.ui.ContentEditor.configure(editorConfig);
				Stevenson.ui.Loader.hide();
			},
			error:  function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Exception loading properties editor: '
						+ message+', if you haven\' already, <a href="/cms/edit.html?new=true#_editors/'+layout+'.json">configure the editor for this template</a>.');
			}
		});
	};
	var initialize = function() {
		Stevenson.log.info('Editing page');

		$.each(Stevenson.repo.layouts, function(index, elem){
			$('#layout').append('<option>' + elem + '</option>');
		});
	
		if (Stevenson.Account.repo == '') {
			Stevenson.log.warn('Website repository not set');
			Stevenson.ui.Messages.displayError('Website repository not set.  <a href="/cms">Configure</a>');
		}
		
		var pagePath = window.location.hash.substr(1);

		$('h2').append(pagePath);
		if (Stevenson.util.getParameter('new') == 'true') {
			Stevenson.log.info('Creating new page');
			currentPage = new Page(pagePath, '');
			Stevenson.ui.ContentEditor.setContent(currentPage);

			$('#layout').change(function(){
				$('.properties .fields').html('');
				loadEditor($('#layout').val(),{});
			});
		} else {
			Stevenson.ui.Loader.display('Loading page...', 100);
			Stevenson.log.info('Updating existing page');
			Stevenson.repo.getFile({
				path: pagePath,
				success: function(file){
					Stevenson.log.debug('Retrieved page');
					currentPage = file;
					
					Stevenson.log.debug('Setting content');
					Stevenson.ui.ContentEditor.setContent(file);
					
					Stevenson.log.debug('Loading properties editor');
					var properties = file.getProperties();
					if(properties) {
						$('#layout').val(properties.layout);
						loadEditor(properties.layout, properties);
					} else {
						$('.container.properties').hide();
						Stevenson.ui.Loader.hide();
					}
					$('#layout').change(function(){
						$('.properties .fields').html('');
						loadEditor($('#layout').val(),properties);
					});
				},
				error: function(message){
					Stevenson.ui.Loader.hide();
					Stevenson.ui.Messages.displayError('Exception loading page: '
							+ message);
				}
			});
		}
	};
	Stevenson.ext.afterInit(initialize);
	$(document).ready(function(){
		$('.save').click(function(){
			
			Stevenson.ui.Loader.display('Saving page...', 100);
			
			var properties = currentPage.getProperties();
			
			var layout = $('#layout').val();
			var title = $('#title').val();
			if(properties) {
				properties.layout = layout;
				Stevenson.ui.Editor.save(editorConfig, properties);
			} else {
				if(layout != ''){
					properties = {};
					properties.layout = layout;
					Stevenson.ui.Editor.save(editorConfig, properties);
				}
			}
			
			if(properties){
				Stevenson.log.debug('Adding Jekyll header');
				var header = '---\n';
				header += YAML.stringify(properties);
				header += '---\n\n';
				currentPage.content = header + Stevenson.ui.ContentEditor.getContent(currentPage);
			} else {
				Stevenson.log.debug('Not adding Jekyll header');
				currentPage.content = Stevenson.ui.ContentEditor.getContent(currentPage);
			}
			
			Stevenson.repo.savePage({
				page: currentPage,
				path: window.location.hash.substr(1),
				message: $('#message').val(),
				error: function(message){
					Stevenson.ui.Loader.hide();
					Stevenson.ui.Messages.displayError('Exception saving page: '
							+ message);
				},
				success: function(){
					Stevenson.ui.Messages.displayMessage('Page saved successfully!');
					Stevenson.ui.Loader.hide();
					if (Stevenson.util.getParameter('new') == 'true') {
						window.location.replace('/cms/edit.html#'+currentPage.path);
					} else {
						initialize();
					}
				}
			});
			return false;
		});
	});
})(jQuery);