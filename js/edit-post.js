(function($) {
	
	var currentPost = null;

	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Editing post');

		$.each(Stevenson.repo.layouts, function(index, elem){
			$('#layout').append('<option>' + elem + '</option>');
		});
		
		if (Stevenson.Account.repo == '') {
			Stevenson.log.warn('Website repository not set');
			Stevenson.ui.Messages.displayError('Website repository not set.  <a href="/account.html">Configure</a>');
		}

		var postPath = Stevenson.util.getParameter('post');

		if(postPath == '' || postPath.indexOf('.html') != -1){
			new nicEditor({
				iconsPath : '/img/nicEditorIcons.gif'
			}).panelInstance('content');
		}
		
		if (!postPath || postPath == '') {
			Stevenson.log.info('Creating new post');
		} else {
			Stevenson.ui.Loader.display('Loading post...', 100);
			Stevenson.log.info('Updating existing post');
			Stevenson.repo.getFile({
				path: postPath,
				success: function(file){
					currentPost = file;
					Stevenson.log.debug('Retrieved post');

					$('h2').append(postPath);
					Stevenson.log.debug('Setting properties');
					$('#date').datepicker('setValue', file.getDate());
					
					var properties = file.getProperties();
					$('#layout').val(properties.layout);
					$('#title').val(properties.title);
					
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
					Stevenson.ui.Messages.displayError('Exception loading posts: '
							+ message);
				}
			});
		}
	});
	$(document).ready(function(){
		$('#edit-post #date').datepicker();
		$('.save').click(function(){
			
			Stevenson.ui.Loader.display('Saving post...', 100);
			
			var properties = currentPost.getProperties();
			
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
				page: currentPost,
				path: Stevenson.util.getParameter('post'),
				message: $('#message').val(),
				error: function(message){
					Stevenson.ui.Loader.hide();
					Stevenson.ui.Messages.displayError('Exception saving post: '
							+ message);
				},
				success: function(){
					Stevenson.ui.Loader.hide();
					window.location = '/edit-site.html#' + Stevenson.util.getParameter('path');
				}
			});
		});
	});
})(jQuery);