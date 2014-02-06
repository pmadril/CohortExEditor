(function($) {
	var editorConfig = null;
	var currentPage = null;
	var loadEditor = function(layout, properties){
		Stevenson.repo.getFile({
			path: '_editors/'+layout+'.json',
			success: function(file){
				editorConfig = JSON.parse(file.getPageContent());
				Stevenson.ui.Editor.load(editorConfig, properties);
				Stevenson.ui.Loader.hide();
			},
			error:  function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Exception loading properties: '
						+ message);
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
			Stevenson.ui.Messages.displayError('Website repository not set.  <a href="account.html">Configure</a>');
		}

		var pagePath = Stevenson.util.getParameter('page');

		if(pagePath == '' || pagePath.indexOf('.html') != -1){
			new nicEditor({
				iconsPath : './img/nicEditorIcons.gif'
			}).panelInstance('content');
		}

		$('h2').append(pagePath);
		$('.cancel').attr('href', 'edit-site.html#' + Stevenson.util.getParameter('path'));
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
					Stevenson.log.debug('Loading properties editor');
					var properties = file.getProperties();
					if(properties) {
						$('#layout').val(properties.layout);
						loadEditor(properties.layout, properties);
					} else {
						$('.container.properties').hide();
						Stevenson.ui.Loader.hide();
					}
					
					Stevenson.log.debug('Setting content');
					
					var edit = nicEditors.findEditor('content');
					if(edit) {
						edit.setContent(file.getPageContent());
					} else {
						$('#content').html(file.getPageContent());
					}
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
			
			var edit = nicEditors.findEditor('content');
			if(edit) {
				newContent += edit.getContent();
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