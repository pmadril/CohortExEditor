(function($) {
	var loadFiles = function(path){
		Stevenson.ui.Loader.display('Loading files...', 100);
		
		Stevenson.repo.getFiles({
			path: path,
			success: function(files){
				window.location.hash = path;
				$('#files').attr('data-path', path);
				$('.breadcrumb .path').html(path);
				$('#files tbody').html('');
				$.each(files, function(index, file){
					$('#files tbody').mustache('file', file);
				});
				$('.folder-close').click(function(){
					loadFiles($(this).attr('data-path'));
				});
				$('#files input[type=checkbox]').click(function(){
					var checked = this;
					$('#files input[type=checkbox]').each(function(index, item){
						if(item != checked){
							$(item).removeAttr('checked');
						}
					});
				});
				Stevenson.ui.Loader.hide();
			},
			error: function(message){
				Stevenson.ui.Loader.hide();
				Stevenson.ui.Messages.displayError('Unable to load branches: ' + message);
			}
		});
	};
	
	Stevenson.ext.afterInit(function() {
		Stevenson.log.info('Initializing files');
		
		$('.breadcrumb .repo').html(Stevenson.Account.repo);
		$('.breadcrumb .branch').html(Stevenson.Account.branch);
		
		var path = window.location.hash;
		if(path != ''){
			path = path.substr(1);
		}
		$('.breadcrumb .path').html(path);
		loadFiles(path);
	});
	
	$(document).ready(function(){
		$('#file-name-modal .btn').click(function() {
                        $('#file-name-modal .modal-body .alert-error').remove();
                        var name = $('#file-name').val();
                        if(name != ''){
                                var path = $('#files').attr('data-path');
                                Stevenson.repo.savePage({
                                        path: path+"/"+name,
                                        page: {
                                                content:''
                                        },
                                        message: 'Creating new page ' + name,
                                        success: function(){
                                                if(path.indexOf('_post') != -1) {
                                                        window.location = 'edit-post.html?new=true&path='+$('#files').attr('data-path') + '&post=' + name;
                                                } else {
                                                        window.location = 'edit-page.html?new=true&path='+$('#files').attr('data-path') + '&page=' + name;
                                                }        
                                        },
                                        error: function(msg){
                                                $('#new-file-name').addClass('error');
                                                $('#file-name-modal .modal-body').prepend('<div class="alert alert-error">Error creating page: '+msg+'.</div>');
                                        }
                                });

                        } else {
                                $('#new-file-name').addClass('error');
                                $('#file-name-modal .modal-body').prepend('<div class="alert alert-error">Please enter a file name.</div>');
                        }
                });
		$('.new').click(function(){
			$('#new-file-modal').modal({
				show: true
			});
			return false;
		});
		$('.file-edit').click(function(){
			Stevenson.ui.Loader.display('Loading editor...', 100);
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			var lowerPost = path.toLowerCase();
			if(lowerPost.indexOf('_post') != -1) {
				window.location = 'edit-post.html?post=' + path + '&path='+$('#files').attr('data-path');
			} else {
				window.location = 'edit-page.html?page=' + path + '&path='+$('#files').attr('data-path');
			}
			return false;
		});
		$('.file-delete').click(function(){
			$('#delete-file-modal').modal({
				show: true
			});
			var path = $('#files input[type=checkbox]:checked').parents('tr').attr('data-path');
			$('#delete-file-modal .yes').click(function(){
				$('#delete-file-modal').modal('hide');
				Stevenson.ui.Loader.display('Deleting...', 100);
				Stevenson.repo.deleteFile({
					path: path,
					success: function(path){
						Stevenson.ui.Messages.displayMessage("Deleted file: "+path);
						Stevenson.ui.Loader.hide();
					},
					error: function(message){
						Stevenson.ui.Messages.displayError("Failed to delete file: "+path+" due to error "+message);
						Stevenson.ui.Loader.hide();
					}
				});
				return false;
			});
			$('#delete-file-modal .no').click(function(){
				$('#loading-modal').modal('hide');
				return false;
			});
			return false;
		});
	});
})(jQuery);
