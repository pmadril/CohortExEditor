(function($) {
	var currentPage = null;
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Editing page');

		$.each(Stevenson.repo.layouts, function(index, elem){
			$('#layout').append('<option>' + elem + '</option>');
		});
	
		if (Stevenson.Account.repo == '') {
			Stevenson.log.warn('Website repository not set');
			Stevenson.ui.Messages.displayError('Website repository not set.  <a href="account.html">Configure</a>');
		}

		var postPath = Stevenson.util.getParameter('page');

		if(postPath == '' || postPath.indexOf('.html') != -1){
			new nicEditor({
				iconsPath : './img/nicEditorIcons.gif'
			}).panelInstance('content');
		}

		$('h2').append(postPath);
		$('.cancel').attr('href', 'edit-site.html#' + Stevenson.util.getParameter('path'));
		if (Stevenson.util.getParameter('new') == 'true') {
			Stevenson.log.info('Creating new page');
			currentPage = new Page(postPath, '');
		} else {
			Stevenson.ui.Loader.display('Loading page...', 100);
			Stevenson.log.info('Updating existing page');
			Stevenson.repo.getFile({
				path: postPath,
				success: function(file){
					Stevenson.log.debug('Retrieved page');

					currentPage = file;
					Stevenson.log.debug('Setting properties');
					var properties = file.getProperties();
					if(properties) {
						$('#layout').val(properties.layout);
						$('#title').val(properties.title);
					} else {
						$('.container.properties').hide();
					}
					
					Stevenson.log.debug('Setting content');
					
					var edit = nicEditors.findEditor('content');
					if(edit) {
						edit.setContent(file.getPageContent());
					} else {
						$('#content').html(file.getPageContent());
					}
					
					Stevenson.ui.Loader.hide();
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
				properties.title = title;
			} else {
				if(layout != '' || title != ''){
					properties = {};
					properties.layout = layout;
					properties.title = title;
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
					Stevenson.ui.Loader.hide();
					window.location = 'edit-site.html#' + Stevenson.util.getParameter('path');
				}
			});
		});
	});
})(jQuery);