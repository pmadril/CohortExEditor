(function($) {
	var htmlEditor = false;
	var editorConfig = null;
	var currentPage = null;
	var loadEditor = function(layout, properties){
		Stevenson.repo.getEditorConfig({
			layout: layout,
			success: function(config){
				editorConfig = config;
				Stevenson.ui.Editor.load(editorConfig, properties);
				var rteConfig = $.extend({
					selector: '#content',
					plugins: ["advlist autolink link image lists visualblocks code media table contextmenu"],
					menubar: false
				}, config.rte);
				var pagePath = Stevenson.util.getParameter('page');
				if(pagePath == '' || pagePath.indexOf('.html') != -1){
					tinymce.init(rteConfig);
					htmlEditor = true;
				}
				Stevenson.ui.Loader.hide();
			},
			error:  function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Exception loading properties editor: '
						+ message+', if you haven\' already, <a href="edit-layout.html?layout='+layout+'">configure the editor for this template</a>.');
			}
		});
	};
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Editing page');

		$.each(Stevenson.repo.layouts, function(index, elem){
			$('#layout').append('<option>' + elem + '</option>');
		});
	
		if (Stevenson.Account.repo == '') {
			Stevenson.log.warn('Website repository not set');
			Stevenson.ui.Messages.displayError('Website repository not set.  <a href="/cms">Configure</a>');
		}

		var pagePath = Stevenson.util.getParameter('page');

		$('h2').append(pagePath);
		if (Stevenson.util.getParameter('new') == 'true') {
			Stevenson.log.info('Creating new page');
			currentPage = new Page(pagePath, '');

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
					$('#content').val(file.getPageContent());
					
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
	});
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
			
			var newContent = '';
			if(properties){
				Stevenson.log.debug('Adding Jekyll header');
				newContent += '---\n';
				newContent += YAML.stringify(properties);
				newContent += '---\n\n';
			} else {
				Stevenson.log.debug('Not adding Jekyll header');
			}
			
			if(htmlEditor) {
				newContent += tinymce.activeEditor.getContent();
			} else {
				newContent += $('#content').val();
			}
			currentPage.content = newContent;
			
			Stevenson.repo.savePage({
				page: currentPage,
				path: Stevenson.util.getParameter('page'),
				message: $('#message').val(),
				error: function(message){
					Stevenson.ui.Loader.hide();
					Stevenson.ui.Messages.displayError('Exception loading page: '
							+ message);
				},
				success: function(){
					Stevenson.ui.Messages.displayMessage('Page saved successfully!');
					Stevenson.ui.Loader.hide();
				}
			});
		});
	});
})(jQuery);